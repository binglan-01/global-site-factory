#!/bin/bash
# ==============================================================================
# ComfyUI 多实例 + Z-Image 集群管理脚本
# 用途：串行启动多 GPU 多端口 ComfyUI，全部就绪后启动 Z-Image，并提供终端监控面板
# ==============================================================================

# 移除 set -euo pipefail，避免脚本因子进程错误而意外退出
# 改为手动处理关键错误
set -uo pipefail

# ============================================
# 【阶段 1：配置定义区】—— 按需修改以下配置
# ============================================

# ============================================
# 环境切换：修改下面的 ENV_MODE 变量
#   - ENV_MODE="test"     # 测试环境
#   - ENV_MODE="prod"     # 生产环境
# ============================================
ENV_MODE="prod"  # 当前使用：测试环境

# ============================================
# 测试环境配置
# ============================================
TEST_COMFYUI_DIR="/media/guolan/work/code/developer/ComfyUI-test-env/ComfyUI"
TEST_CONDA_ENV="/home/guolan/miniconda3/envs/conda-zjl-env"

# 测试环境端口映射（保持此前「每 GPU 两个端口」的 8211 段布局不变）
declare -A TEST_PORT_GPU_MAP=(
    [8211]=0 [8244]=0
    [8212]=1 [8221]=1
    [8213]=2 [8222]=2
    [8214]=3 [8223]=3
    [8231]=4 [8224]=4
    [8232]=5 [8241]=5
    [8233]=6 [8242]=6
    [8234]=7 [8243]=7
)
TEST_SKIP_PORTS=()  # 测试环境不跳过任何端口
TEST_ENABLE_ZIMAGE=false  # 测试环境不启用 Z-Image

# ============================================
# 生产环境配置
# ============================================
PROD_COMFYUI_DIR="/media/guolan/work/GuoLanVideo/ComfyUI-0.8.1"
PROD_CONDA_ENV="comfyui_128"

# 生产环境与测试使用同一套端口↔GPU 布局（16 端口）；此前 8232/8246 等「旧生产」端口表已废弃
declare -A PROD_PORT_GPU_MAP=(
    [8211]=0 [8244]=0
    [8212]=1 [8221]=1
    [8213]=2 [8222]=2
    [8214]=3 [8223]=3
    [8231]=4 [8224]=4
    [8232]=5 [8241]=5
    [8233]=6 [8242]=6
    [8234]=7 [8243]=7
)
PROD_SKIP_PORTS=()  # 已取消历史生产中的 8299 跳过项；需要时在数组中填端口即可
PROD_ENABLE_ZIMAGE=true  # 生产环境启用 Z-Image

# ============================================
# 根据 ENV_MODE 应用配置
# ============================================
if [ "$ENV_MODE" = "test" ]; then
    COMFYUI_DIR="$TEST_COMFYUI_DIR"
    COMFYUI_ENV="$TEST_CONDA_ENV"
    declare -A PORT_GPU_MAP="${!TEST_PORT_GPU_MAP[@]}"
    # 重新赋值关联数组（Bash 限制）
    unset PORT_GPU_MAP
    declare -A PORT_GPU_MAP
    for key in "${!TEST_PORT_GPU_MAP[@]}"; do
        PORT_GPU_MAP[$key]="${TEST_PORT_GPU_MAP[$key]}"
    done
    SKIP_PORTS=()
    if [ ${#TEST_SKIP_PORTS[@]} -gt 0 ]; then
        SKIP_PORTS=("${TEST_SKIP_PORTS[@]}")
    fi
    ENABLE_ZIMAGE="$TEST_ENABLE_ZIMAGE"
    ZIMAGE_DIR="/media/guolan/work/code/developer/Z-Image"  # 路径保留但不使用
else
    COMFYUI_DIR="$PROD_COMFYUI_DIR"
    COMFYUI_ENV="$PROD_CONDA_ENV"
    unset PORT_GPU_MAP
    declare -A PORT_GPU_MAP
    for key in "${!PROD_PORT_GPU_MAP[@]}"; do
        PORT_GPU_MAP[$key]="${PROD_PORT_GPU_MAP[$key]}"
    done
    SKIP_PORTS=()
    if [ ${#PROD_SKIP_PORTS[@]} -gt 0 ]; then
        SKIP_PORTS=("${PROD_SKIP_PORTS[@]}")
    fi
    ENABLE_ZIMAGE="$PROD_ENABLE_ZIMAGE"
    ZIMAGE_DIR="/media/guolan/work/code/developer/Z-Image"
fi

CONDA_HOME="$HOME/anaconda3"
ZIMAGE_ENV="Z-Image"
ZIMAGE_GPU=6
ZIMAGE_NAME="Z-Image"

# 溶图服务配置（RongTu - 旧版本 ComfyUI）
RONGTU_DIR="/media/guolan/work/GuoLanVideo/up_comfyui/ComfyUI"
RONGTU_CONDA_ENV="linux_comfyui"
RONGTU_ANACONDA_PATH="$HOME/anaconda3"

# 运行时参数（两个环境共用）
START_TIMEOUT=120       # 单个 ComfyUI 启动超时（秒）
STOP_TIMEOUT=20         # 停止服务时等待进程退出超时（秒）
PORT_RELEASE_TIMEOUT=20 # 重启前等待端口释放超时（秒）
MAX_RETRY=1               # 失败后重试次数（0 表示不重试）
REFRESH_INTERVAL=5        # 监控面板无条件刷新间隔（秒）
LOG_MAX_BYTES=$((100 * 1024 * 1024))  # 单个日志超过 100MB 时触发截断
LOG_KEEP_BYTES=$((80 * 1024 * 1024))  # 截断后保留最近 80MB
COMFYUI_HEALTH_PATH="/system_stats"   # HTTP 探测的首选路径

# 日志与 PID 目录（脚本所在目录）
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$BASE_DIR/logs"
PID_DIR="$BASE_DIR/.pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

# 脚本运行总日志：所有 log_info/log_ok/log_warn/log_err 事件都会追加到这里
# 受 LOG_MAX_BYTES (100MB) / LOG_KEEP_BYTES (80MB) 截断策略保护，超限自动丢弃旧日志只留最新内容
SCRIPT_LOG="$LOG_DIR/run_cluster.log"
touch "$SCRIPT_LOG" 2>/dev/null || true

# 状态存储
declare -A SVC_STATUS       # running / starting / booting / stopped / error / timeout
declare -A SVC_PID
declare -A SVC_START_TIME
declare -A SVC_MESSAGE      # 每个服务最近一次的状态消息（在面板"备注"列显示）
SVC_ORDER=()                # 启动顺序数组
SVC_ACTIVE_ORDER=()         # 过滤 SKIP_PORTS 后实际纳管的端口顺序

# 溶图服务状态追踪（key=端口, value=原始服务名如 ComfyUI:8234）
# 1) 父环境同名普通变量/export 会令「仅 declare -p 再判断是否 declare -A」失效，随后在 set -u 下崩溃
# 2) 删掉本段 declare 仍会导致 unbound variable：务必保留
unset RONGTU_MAPPING 2>/dev/null || true
declare -A RONGTU_MAPPING

# 将溶图关联数组的「端口键」复制到调用方数组（set -u 下对部分 Bash 组合的 ${# assoc[@]} / ${!assoc[@]} 会误报 unbound，快照到普通数组再遍历最稳）。
_rongtu_map_copy_keys_to() {
    local -n __rongtu_keys_out=$1
    set +u
    __rongtu_keys_out=("${!RONGTU_MAPPING[@]}")
    set -u
}

# 全局消息（显示在面板底部一行；运行期所有 log_* 都汇入此处）
GLOBAL_MSG=""
GLOBAL_MSG_LEVEL=""         # INFO / OK / WARN / ERR
GLOBAL_MSG_AT=0

# 启动阶段计数器（仅用于完成时的汇总）
total_steps=0

# 上次绘制时的状态快照（用于检测变化）
declare -A LAST_SVC_STATUS
declare -A LAST_SVC_MESSAGE
LAST_GLOBAL_MSG=""
LAST_GLOBAL_MSG_LEVEL=""
LAST_DRAW_TIME=0

# ============================================
# 工具函数
# ============================================

# 启动前致命错误：直接打印并退出（dashboard 还未启动时使用，不算运行期日志）
die() {
    echo -e "\033[31m[ERR]\033[0m $*" >&2
    exit 1
}

# 设置全局消息：运行期所有日志改为通过面板底部一行呈现，避免污染界面
# 同时落盘到 SCRIPT_LOG，便于退出后追溯历史；写盘失败不影响主流程
set_global_msg() {
    local level=$1
    shift
    local message="$*"
    GLOBAL_MSG="$message"
    GLOBAL_MSG_LEVEL="$level"
    GLOBAL_MSG_AT=$(date +%s)

    if [ -n "${SCRIPT_LOG:-}" ]; then
        printf '[%s] [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$level" "$message" >> "$SCRIPT_LOG" 2>/dev/null || true
    fi
}

# log_* 不再输出到终端，统一写入 GLOBAL_MSG（dashboard 会读取并显示）
log_info() { set_global_msg INFO "$*"; }
log_ok()   { set_global_msg OK   "$*"; }
log_warn() { set_global_msg WARN "$*"; }
log_err()  { set_global_msg ERR  "$*"; }

# 检查进程是否存活
is_alive() {
    local pid=${1:-}
    [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}

is_skipped_port() {
    local port=$1
    local sp

    for sp in "${SKIP_PORTS[@]}"; do
        [[ "$port" == "$sp" ]] && return 0
    done

    return 1
}

file_size_bytes() {
    local file=$1

    [ -f "$file" ] || { echo 0; return; }
    if stat -c%s "$file" >/dev/null 2>&1; then
        stat -c%s "$file"
    else
        wc -c < "$file" | awk '{print $1}'
    fi
}

truncate_log_if_needed() {
    local logfile=$1
    local size

    [ -f "$logfile" ] || return 0
    size=$(file_size_bytes "$logfile")
    [ "$size" -le "$LOG_MAX_BYTES" ] && return 0

    local lockdir="${logfile}.rotate.lock"
    local tmp="${logfile}.rotate.$$"

    # 同一日志只允许一个截断操作；失败说明已有轮转在进行，跳过本次检查。
    mkdir "$lockdir" 2>/dev/null || return 0

    if tail -c "$LOG_KEEP_BYTES" "$logfile" > "$tmp" 2>/dev/null; then
        # 使用 copytruncate 保持原日志 inode 不变，避免后台 Python 继续写被 mv 走的旧文件。
        # 取舍：截断窗口内极少量新日志可能丢失；对本运维脚本可接受。
        : > "$logfile"
        cat "$tmp" >> "$logfile"
        log_warn "日志已截断: $logfile (${size} bytes -> 保留最近 ${LOG_KEEP_BYTES} bytes)"
    fi
    rm -f "$tmp"
    rmdir "$lockdir" 2>/dev/null || true
}

# 清理所有服务（被 trap 调用）
cleanup_all() {
    local exit_code=${1:-0}
    trap - HUP INT TERM EXIT

    log_warn "收到终止信号，正在清理所有服务..."
    
    local -a __rt_kill_ports=()
    _rongtu_map_copy_keys_to __rt_kill_ports
    if [ "${#__rt_kill_ports[@]}" -gt 0 ]; then
        # 先停止所有溶图服务
        for port in "${__rt_kill_ports[@]}"; do
            local rname="RongTu:$port"
            local rpid=${SVC_PID[$rname]:-}
            if [ -n "$rpid" ] && is_alive "$rpid"; then
                kill -TERM "$rpid" 2>/dev/null || true
            fi
        done

        sleep 2

        # 强制杀死溶图进程
        for port in "${__rt_kill_ports[@]}"; do
            local rname="RongTu:$port"
            local rpid=${SVC_PID[$rname]:-}
            if [ -n "$rpid" ] && is_alive "$rpid"; then
                kill -KILL "$rpid" 2>/dev/null || true
            fi
        done
    fi
    
    local pids=()
    for f in "$PID_DIR"/*.pid; do
        [ -f "$f" ] || continue
        local pid
        pid=$(cat "$f" 2>/dev/null || true)
        [ -n "$pid" ] && pids+=("$pid")
    done

    if [ ${#pids[@]} -gt 0 ]; then
        for pid in "${pids[@]}"; do
            if is_alive "$pid"; then
                kill -TERM "$pid" 2>/dev/null || true
            fi
        done

        sleep 2

        for pid in "${pids[@]}"; do
            if is_alive "$pid"; then
                kill -KILL "$pid" 2>/dev/null || true
            fi
        done
    fi

    rm -rf "$PID_DIR"

    # 清屏并打印最终一行，确保用户在 dashboard 关闭后仍能看到退出反馈
    printf '\033[2J\033[H\n所有服务已清理完毕，脚本退出 (code=%s)\n' "$exit_code" >&2
    exit "$exit_code"
}

# SSH 会话断开辅助检测
check_ssh_session() {
    if [[ -n "${SSH_CONNECTION:-}" ]]; then
        local ppid=$(ps -o ppid= -p $$ 2>/dev/null | tr -d ' ' || true)
        if [ -n "$ppid" ] && [ "$ppid" != "1" ] && ! kill -0 "$ppid" 2>/dev/null; then
            log_warn "检测到 SSH 会话父进程已消失"
            cleanup_all 129
        fi
    fi
}

# 注册信号陷阱：SSH 断开(HUP)、Ctrl+C(INT)、kill(TERM)、脚本退出(EXIT)
trap 'cleanup_all 129' HUP
trap 'cleanup_all 130' INT
trap 'cleanup_all 143' TERM
trap 'cleanup_all $?' EXIT

# ============================================
# 【阶段 2：串行启动引擎】
# ============================================

tcp_port_open() {
    local port=$1
    local host="127.0.0.1"

    if command -v nc >/dev/null 2>&1; then
        nc -z -w 2 "$host" "$port" >/dev/null 2>&1
    elif command -v timeout >/dev/null 2>&1; then
        timeout 2 bash -c ":</dev/tcp/${host}/${port}" >/dev/null 2>&1
    else
        bash -c ":</dev/tcp/${host}/${port}" >/dev/null 2>&1
    fi
}

# 单 URL：返回 200 即就绪（旧版仅靠 /system_stats，新版前端栈下常需多路径兜底）
curl_http_ok() {
    local url=$1
    local status=""
    command -v curl >/dev/null 2>&1 || return 1
    status=$(curl -sS --max-time 2 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)
    [ "$status" = "200" ]
}

python_http_ok() {
    local python_bin=$1 url=$2
    [ -n "$python_bin" ] || return 1
    "$python_bin" - "$url" <<'PY' >/dev/null 2>&1
import sys
import urllib.request

try:
    with urllib.request.urlopen(sys.argv[1], timeout=2) as response:
        sys.exit(0 if response.status == 200 else 1)
except Exception:
    sys.exit(1)
PY
}

is_http_ready() {
    local port=$1
    local python_bin=${2:-}
    local host="127.0.0.1"
    local path url

    for path in "${COMFYUI_HEALTH_PATH:-/system_stats}" '/' '/api/object_info'; do
        url="http://${host}:${port}${path}"
        if curl_http_ok "$url"; then
            return 0
        fi
        if python_http_ok "$python_bin" "$url"; then
            return 0
        fi
    done
    return 1
}

# 日志已打印 ComfyUI 默认的 GUI 地址行，且本机端口可连 → 视为 HTTP 探针失败时的就绪兜底
comfyui_log_reports_gui_listening() {
    local log=$1
    local port=$2
    [ -f "$log" ] || return 1
    grep -qF "To see the GUI go to:" "$log" 2>/dev/null || return 1
    grep -qE ":${port}([[:space:]]|$)" "$log" 2>/dev/null
}

# ComfyUI 就绪检测：只检查日志中是否有 Starting server（忽略大小写）
is_comfyui_ready() {
    local logfile=$1
    [ -f "$logfile" ] && grep -qiF 'Starting server' "$logfile" 2>/dev/null
}



resolve_conda_python() {
    local env_name=$1
    local candidate=""

    # 如果 env_name 是绝对路径，直接使用（测试环境支持）
    if [[ "$env_name" == /* ]]; then
        candidate="$env_name/bin/python"
        if [ -x "$candidate" ]; then
            printf '%s\n' "$candidate"
            return 0
        fi
        return 1
    fi

    # 原有逻辑：base 环境或命名环境（生产环境）
    if [[ "$env_name" == "base" ]]; then
        candidate="$CONDA_HOME/bin/python"
    else
        candidate="$CONDA_HOME/envs/$env_name/bin/python"
    fi

    if [ -x "$candidate" ]; then
        printf '%s\n' "$candidate"
        return 0
    fi

    if command -v conda >/dev/null 2>&1; then
        local env_prefix
        env_prefix=$(conda env list 2>/dev/null | awk -v env="$env_name" '$1 == env {print $NF; exit}')
        if [ -n "$env_prefix" ] && [ -x "$env_prefix/bin/python" ]; then
            printf '%s\n' "$env_prefix/bin/python"
            return 0
        fi
    fi

    return 1
}

start_comfyui() {
    local port=$1
    local gpu=$2
    local logfile="$LOG_DIR/comfyui_${port}.log"
    local pidfile="$PID_DIR/comfyui_${port}.pid"
    local name="ComfyUI:$port"
    local python_bin=""

    : > "$logfile"

    SVC_STATUS[$name]="starting"
    SVC_MESSAGE[$name]="启动中 (GPU $gpu)"
    SVC_START_TIME[$name]=$(date +%s)

    # 启动前预检：避免目标端口已被其他进程占用导致 EADDRINUSE 误判为启动超时
    if tcp_port_open "$port"; then
        SVC_STATUS[$name]="error"
        SVC_MESSAGE[$name]="端口 $port 启动前已被占用"
        echo "端口 $port 在启动前已被占用" >> "$logfile"
        return 1
    fi

    if ! python_bin=$(resolve_conda_python "$COMFYUI_ENV"); then
        SVC_STATUS[$name]="error"
        SVC_MESSAGE[$name]="未找到 Conda 环境 $COMFYUI_ENV"
        echo "未找到 Conda 环境 $COMFYUI_ENV 的 Python" >> "$logfile"
        return 1
    fi

    # 直接使用 Conda 环境内的 Python，先 source anaconda3 activate 脚本确保环境正确加载
    (
        cd "$COMFYUI_DIR" || { echo "目录不存在: $COMFYUI_DIR" >> "$logfile"; exit 1; }
        
        # 先 source anaconda3 的 activate 脚本（生产环境必须）
        source "$CONDA_HOME/etc/profile.d/conda.sh" 2>/dev/null || source "${CONDA_HOME}/bin/activate" 2>/dev/null || true
        
        # 禁用 Python 输出缓冲，让日志尽快落盘（解决监控循环看不到最新日志的问题）
        export PYTHONUNBUFFERED=1
        
        export CUDA_VISIBLE_DEVICES=$gpu
        exec "$python_bin" main.py --listen 0.0.0.0 --port "$port" >> "$logfile" 2>&1
    ) &
    local pid=$!
    echo "$pid" > "$pidfile"
    SVC_PID[$name]=$pid

    # 简单串行启动所有服务
    local waited=0
    local ready=0
    while [ $waited -lt $START_TIMEOUT ]; do
        if ! is_alive "$pid"; then
            SVC_STATUS[$name]="error"
            SVC_MESSAGE[$name]="进程意外退出"
            rm -f "$pidfile"
            return 1
        fi

        if is_comfyui_ready "$logfile"; then
            ready=1
            break
        fi

        sleep 1
        ((++waited))
        SVC_MESSAGE[$name]="启动中 ${waited}s/${START_TIMEOUT}s"
        draw_dashboard
    done

    if [ $ready -eq 1 ]; then
        SVC_STATUS[$name]="running"
        SVC_MESSAGE[$name]="启动成功 (${waited}s)"
        return 0
    else
        SVC_STATUS[$name]="timeout"
        SVC_MESSAGE[$name]="启动超时"
        if is_alive "$pid"; then
            kill -TERM "$pid" 2>/dev/null || true
            sleep_tick 2
            is_alive "$pid" && kill -KILL "$pid" 2>/dev/null || true
        fi
        rm -f "$pidfile"
        return 1
    fi
}

# 串行启动主流程（简化版）
launch_all() {
    # 按 GPU 分组、端口升序构建启动顺序
    SVC_ORDER=()
    for gpu in {0..7}; do
        for port in $(echo "${!PORT_GPU_MAP[@]}" | tr ' ' '\n' | sort -n); do
            [ "${PORT_GPU_MAP[$port]}" -eq "$gpu" ] && SVC_ORDER+=("$port")
        done
    done

    # 过滤暂不启动的端口，并记录实际纳管顺序
    SVC_ACTIVE_ORDER=()
    local skipped_count=0
    for port in "${SVC_ORDER[@]}"; do
        if is_skipped_port "$port"; then
            ((++skipped_count))
        else
            SVC_ACTIVE_ORDER+=("$port")
        fi
    done

    total_steps=${#SVC_ACTIVE_ORDER[@]}

    log_info "开始启动: $total_steps 个 ComfyUI 实例，跳过 $skipped_count 个"

    # 立刻画一次面板：让用户从启动第一秒就能看到表格框架
    draw_dashboard

    # 简单串行启动所有服务
    for port in "${SVC_ACTIVE_ORDER[@]}"; do
        local gpu=${PORT_GPU_MAP[$port]}
        local name="ComfyUI:$port"
        
        # 启动前预检：端口是否被占用
        if tcp_port_open "$port"; then
            SVC_STATUS[$name]="error"
            SVC_MESSAGE[$name]="端口已被占用"
            log_warn "端口 $port 已被占用，跳过"
            continue
        fi
        
        # 尝试启动
        start_comfyui "$port" "$gpu" || true
        
        # 避免同时启动太多实例导致 OOM，每个实例间隔 2 秒
        sleep 2
    done
    
    # 汇总报告
    local success_count=0
    local error_count=0
    for port in "${SVC_ACTIVE_ORDER[@]}"; do
        local name="ComfyUI:$port"
        if [ "${SVC_STATUS[$name]:-}" == "running" ]; then
            ((++success_count))
        else
            ((++error_count))
        fi
    done
    
    if [ $error_count -eq 0 ]; then
        log_ok "全部启动成功！($success_count/$total_steps)"
    else
        log_warn "启动完成：成功 $success_count 个，失败 $error_count 个（可手动重启）"
    fi
    
    # 根据 ENABLE_ZIMAGE 决定是否启动 Z-Image
    if [ "$ENABLE_ZIMAGE" = "true" ]; then
        if ! start_zimage; then
            log_err "Z-Image 启动失败，可用 [z] 指令重试"
        else
            log_ok "全部启动流程结束 (ComfyUI: $total_steps，Z-Image: 1)"
        fi
    else
        log_ok "全部启动流程结束 (ComfyUI: $total_steps，Z-Image: 已禁用)"
    fi
}

# ============================================
# 【阶段 3：可视化监控面板】
# ============================================

status_color() {
    case "$1" in
        running)               printf '\033[32m' ;;  # 绿
        starting)              printf '\033[33m' ;;  # 黄
        stopped|error|timeout) printf '\033[31m' ;; # 红
        *)                    printf '\033[0m'  ;;
    esac
}

# 按"可见宽度"截断或补齐到指定列数；中文字符按 2 列计算，避免 printf %-Ns 错位。
# 假设当前 locale 为 UTF-8（Ubuntu 默认 en_US.UTF-8 / zh_CN.UTF-8 都满足）。
fit_text() {
    local text=$1
    local width=$2
    local i ch chw cur_w=0 truncated=""

    for (( i = 0; i < ${#text}; i++ )); do
        ch=${text:i:1}
        if [[ "$ch" == [\ -~] ]]; then chw=1; else chw=2; fi
        if [ $((cur_w + chw)) -gt "$width" ]; then break; fi
        truncated+="$ch"
        cur_w=$((cur_w + chw))
    done

    printf '%s%*s' "$truncated" $((width - cur_w)) ''
}

# 检查是否需要重绘面板（智能刷新策略）
# 返回 0 = 需要重绘，返回 1 = 不需要
dashboard_should_redraw() {
    local now=$(date +%s)
    
    # 规则 1：距上次绘制超过 REFRESH_INTERVAL 秒，必须重绘（周期刷新）
    if [ $((now - LAST_DRAW_TIME)) -ge $REFRESH_INTERVAL ]; then
        return 0
    fi
    
    # 规则 2：SVC_STATUS 变化（急迫刷新）
    local port name
    for port in "${SVC_ACTIVE_ORDER[@]}"; do
        name="ComfyUI:$port"
        if [ "${SVC_STATUS[$name]:-"-"}" != "${LAST_SVC_STATUS[$name]:-"-"}" ]; then
            return 0
        fi
    done
    
    # 检查 Z-Image 状态变化
    if [ "$ENABLE_ZIMAGE" = "true" ]; then
        if [ "${SVC_STATUS[$ZIMAGE_NAME]:-"-"}" != "${LAST_SVC_STATUS[$ZIMAGE_NAME]:-"-"}" ]; then
            return 0
        fi
    fi
    
    # 规则 3：全局消息变化（急迫刷新）
    if [ "$GLOBAL_MSG" != "$LAST_GLOBAL_MSG" ] || [ "$GLOBAL_MSG_LEVEL" != "$LAST_GLOBAL_MSG_LEVEL" ]; then
        return 0
    fi
    
    # 其余情况（仅 SVC_MESSAGE 变）等待周期刷新
    return 1
}

# 保存当前状态快照
save_state_snapshot() {
    LAST_GLOBAL_MSG="$GLOBAL_MSG"
    LAST_GLOBAL_MSG_LEVEL="$GLOBAL_MSG_LEVEL"
    LAST_DRAW_TIME=$(date +%s)
    
    # 清空旧快照
    for name in "${!LAST_SVC_STATUS[@]}"; do
        unset "LAST_SVC_STATUS[$name]"
        unset "LAST_SVC_MESSAGE[$name]"
    done
    
    # 保存新快照
    for name in "${!SVC_STATUS[@]}"; do
        LAST_SVC_STATUS[$name]="${SVC_STATUS[$name]:-}"
        LAST_SVC_MESSAGE[$name]="${SVC_MESSAGE[$name]:-}"
    done
}

draw_dashboard() {
    # 智能刷新策略：
    # 1. --force 参数：强制重绘
    # 2. dashboard_should_redraw：状态变化或周期超时
    # 3. 否则跳过
    if [ "${1:-}" != "--force" ] && ! dashboard_should_redraw; then
        return 0
    fi
    
    # 保存光标位置（如果在输入状态）
    printf "\033[s"  # 保存光标
    
    printf "\033[2J\033[H"  # ANSI 清屏并归位

    # 列宽合计 75 + 5 个 " │ "（15）+ 两端 "║ "/"" ║"（4）= 94，与上下框线（92 个 ═ + ╔╗ = 94）对齐
    local W_NAME=10 W_GPU=3 W_PORT=5 W_STATUS=9 W_RUN=10 W_MSG=38

    echo "╔════════════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║              ComfyUI 测试环境集群实时监控面板                                              ║"
    echo "╠════════════════════════════════════════════════════════════════════════════════════════════╣"
    printf "║ %s │ %s │ %s │ %s │ %s │ %s ║\n" \
        "$(fit_text 服务 $W_NAME)" \
        "$(fit_text GPU $W_GPU)" \
        "$(fit_text 端口 $W_PORT)" \
        "$(fit_text 状态 $W_STATUS)" \
        "$(fit_text 运行时间 $W_RUN)" \
        "$(fit_text 备注 $W_MSG)"
    echo "╠════════════════════════════════════════════════════════════════════════════════════════════╣"

    local now=$(date +%s)

    # 总脚本日志也走 100MB 截断策略，避免长时间运行后撑爆磁盘
    truncate_log_if_needed "$SCRIPT_LOG"

    # ---- ComfyUI 服务 ----
    for port in "${SVC_ACTIVE_ORDER[@]}"; do
        local name="ComfyUI:$port"
        
        # 检查该端口是否已被溶图替换
        set +u
        local __ru="${RONGTU_MAPPING[$port]:-}"
        set -u
        if [ -n "$__ru" ]; then
            # 显示为“已替换”状态（灰色）
            local color="\033[90m"  # 灰色
            printf "║ ${color}%s\033[0m │ %s │ %s │ ${color}%s\033[0m │ %s │ %s ║\n" \
                "$(fit_text "C:$port"   $W_NAME)" \
                "$(fit_text "${PORT_GPU_MAP[$port]}" $W_GPU)" \
                "$(fit_text "$port"     $W_PORT)" \
                "$(fit_text "replaced"  $W_STATUS)" \
                "$(fit_text "-"         $W_RUN)" \
                "$(fit_text "[已切换为溶图]" $W_MSG)"
            continue  # 跳过正常显示
        fi
        
        local gpu=${PORT_GPU_MAP[$port]}
        local logfile="$LOG_DIR/comfyui_${port}.log"
        local pid=${SVC_PID[$name]:-}
        local status=${SVC_STATUS[$name]:-"-"}
        local start=${SVC_START_TIME[$name]:-0}
        local message=${SVC_MESSAGE[$name]:-"-"}

        truncate_log_if_needed "$logfile"

        # 实时检测：之前 running/starting/booting 但进程已消失 → 标记为 stopped 并染红
        if [[ "$status" == "running" || "$status" == "starting" || "$status" == "booting" ]] && ! is_alive "$pid"; then
            status="stopped"
            message="进程已断开（详见日志）"
            SVC_STATUS[$name]="stopped"
            SVC_MESSAGE[$name]="$message"
        fi

        local runtime="-"
        if [ "$start" -gt 0 ]; then
            local secs=$((now - start))
            runtime="$(printf '%02d:%02d:%02d' $((secs/3600)) $((secs%3600/60)) $((secs%60)))"
        fi

        local color
        color=$(status_color "$status")

        local status_disp="$status"
        case "$status" in
            starting) status_disp="启动中" ;;
            running)  status_disp="运行中" ;;
            *) ;;
        esac

        printf "║ ${color}%s\033[0m │ %s │ %s │ ${color}%s\033[0m │ %s │ %s ║\n" \
            "$(fit_text "C:$port"   $W_NAME)" \
            "$(fit_text "$gpu"      $W_GPU)" \
            "$(fit_text "$port"     $W_PORT)" \
            "$(fit_text "$status_disp" $W_STATUS)" \
            "$(fit_text "$runtime"  $W_RUN)" \
            "$(fit_text "$message"  $W_MSG)"
    done

    echo "╠════════════════════════════════════════════════════════════════════════════════════════════"

    # ---- Z-Image (如果启用) ----
    if [ "$ENABLE_ZIMAGE" = "true" ]; then
        local zname="$ZIMAGE_NAME"
        local zpid=${SVC_PID[$zname]:-}
        local zstatus=${SVC_STATUS[$zname]:-"-"}
        local zstart=${SVC_START_TIME[$zname]:-0}
        local zmessage=${SVC_MESSAGE[$zname]:-"-"}

        truncate_log_if_needed "$LOG_DIR/zimage.log"
        if [[ "$zstatus" == "running" || "$zstatus" == "starting" ]] && ! is_alive "$zpid"; then
            zstatus="stopped"
            zmessage="进程已断开（详见日志）"
            SVC_STATUS[$zname]="stopped"
            SVC_MESSAGE[$zname]="$zmessage"
        fi

        local zruntime="-"
        if [ "$zstart" -gt 0 ]; then
            local zsecs=$((now - zstart))
            zruntime="$(printf '%02d:%02d:%02d' $((zsecs/3600)) $((zsecs%3600/60)) $((zsecs%60)))"
        fi

        local zcolor
        zcolor=$(status_color "$zstatus")
        printf "║ ${zcolor}%s\033[0m │ %s │ %s │ ${zcolor}%s\033[0m │ %s │ %s ║\n" \
            "$(fit_text "Z-Image"      $W_NAME)" \
            "$(fit_text "$ZIMAGE_GPU"  $W_GPU)" \
            "$(fit_text "-"            $W_PORT)" \
            "$(fit_text "$zstatus"     $W_STATUS)" \
            "$(fit_text "$zruntime"    $W_RUN)" \
            "$(fit_text "$zmessage"    $W_MSG)"

        echo "╠════════════════════════════════════════════════════════════════════════════════════════════"
    fi

    # ---- RongTu Services (动态显示) ----
    local -a __rt_ports_snapshot=()
    _rongtu_map_copy_keys_to __rt_ports_snapshot
    if [ "${#__rt_ports_snapshot[@]}" -gt 0 ]; then
        for port in "${__rt_ports_snapshot[@]}"; do
            local rname="RongTu:$port"
            local gpu=${PORT_GPU_MAP[$port]}
            local rpid=${SVC_PID[$rname]:-}
            local rstatus=${SVC_STATUS[$rname]:-"-"}
            local rstart=${SVC_START_TIME[$rname]:-0}
            local rmessage=${SVC_MESSAGE[$rname]:-"-"}
            local rlogfile="$LOG_DIR/rongtu_${port}.log"
            
            truncate_log_if_needed "$rlogfile"
            
            # 实时检测进程状态
            if [[ "$rstatus" == "running" || "$rstatus" == "starting" ]] && ! is_alive "$rpid"; then
                rstatus="stopped"
                rmessage="进程已断开"
                SVC_STATUS[$rname]="stopped"
                SVC_MESSAGE[$rname]="$rmessage"
            fi
            
            local rruntime="-"
            if [ "$rstart" -gt 0 ]; then
                local rsecs=$((now - rstart))
                rruntime="$(printf '%02d:%02d:%02d' $((rsecs/3600)) $((rsecs%3600/60)) $((rsecs%60)))"
            fi
            
            # 紫色标记溶图
            local rcolor="\033[35m"  # 紫色
            printf "║ ${rcolor}%s\033[0m │ %s │ %s │ ${rcolor}%s\033[0m │ %s │ %s ║\n" \
                "$(fit_text "RT:$port"   $W_NAME)" \
                "$(fit_text "$gpu"       $W_GPU)" \
                "$(fit_text "$port"      $W_PORT)" \
                "$(fit_text "$rstatus"   $W_STATUS)" \
                "$(fit_text "$rruntime"  $W_RUN)" \
                "$(fit_text "$rmessage"  $W_MSG)"
        done
        
        echo "╠════════════════════════════════════════════════════════════════════════════════════════════"
    fi

    # ---- 全局消息行 ----
    local global_text="-"
    local gcolor="\033[0m"
    if [ -n "$GLOBAL_MSG" ]; then
        local elapsed=$((now - GLOBAL_MSG_AT))
        global_text="[${GLOBAL_MSG_LEVEL}] ${GLOBAL_MSG} (${elapsed}s 前)"
        case "$GLOBAL_MSG_LEVEL" in
            INFO) gcolor="\033[36m" ;;
            OK)   gcolor="\033[32m" ;;
            WARN) gcolor="\033[33m" ;;
            ERR)  gcolor="\033[31m" ;;
        esac
    fi
    printf "║ ${gcolor}%s\033[0m ║\n" "$(fit_text "$global_text" 90)"

    echo "╠════════════════════════════════════════════════════════════════════════════════════════════╣"
    if [ "$ENABLE_ZIMAGE" = "true" ]; then
        printf "║ %s \n" "$(fit_text "指令: [r 端口] 重启ComfyUI   [s 端口] 停止ComfyUI   [z] 重启Z-Image" 90)"
    else
        printf "║ %s ║\n" "$(fit_text "指令: [r 端口] 重启ComfyUI   [s 端口] 停止ComfyUI" 90)"
    fi
    printf "║ %s \n" "$(fit_text "      [rr 端口] 启动溶图     [rs 端口] 停止溶图并恢复" 90)"
    printf "║ %s ║\n" "$(fit_text "      [k] 强制停止所有       [q] 退出并清理所有" 90)"
    echo "╚════════════════════════════════════════════════════════════════════════════════════════════╝"
    
    # 恢复光标位置
    printf "\033[u"  # 恢复光标
    
    # 保存当前状态快照，供下次比较
    save_state_snapshot
}

# 阻塞等待 N 秒，期间每秒检查状态变化并选择性刷新。
# 注意：不在这里调用 draw_dashboard，避免阻塞用户输入
sleep_tick() {
    local seconds=${1:-1}
    local elapsed=0
    while [ "$elapsed" -lt "$seconds" ]; do
        sleep 1
        elapsed=$((elapsed + 1))
    done
}

wait_for_process_exit() {
    local pid=$1
    local timeout=${2:-$STOP_TIMEOUT}
    local waited=0

    while is_alive "$pid"; do
        [ "$waited" -ge "$timeout" ] && return 1
        sleep 1
        ((++waited))
        # 等待进程退出时不刷新，避免阻塞
    done

    return 0
}

wait_for_port_free() {
    local port=$1
    local timeout=${2:-$PORT_RELEASE_TIMEOUT}
    local waited=0
    local name="ComfyUI:$port"
    local last_refresh=0

    while tcp_port_open "$port"; do
        [ "$waited" -ge "$timeout" ] && return 1
        sleep 1
        ((++waited))
        # 每 5 秒无条件刷新一次面板
        if [ $((waited - last_refresh)) -ge "$REFRESH_INTERVAL" ]; then
            SVC_MESSAGE[$name]="等待端口释放 ${waited}s/${timeout}s"
            draw_dashboard --force
            last_refresh=$waited
        fi
    done

    return 0
}

stop_service() {
    local name="$1"
    local pid=${SVC_PID[$name]:-}
    local pidfile=""

    if [[ "$name" == ComfyUI:* ]]; then
        local port=${name#ComfyUI:}
        pidfile="$PID_DIR/comfyui_${port}.pid"
    elif [[ "$name" == RongTu:* ]]; then
        local port=${name#RongTu:}
        pidfile="$PID_DIR/rongtu_${port}.pid"
    elif [[ "$name" == "$ZIMAGE_NAME" ]]; then
        pidfile="$PID_DIR/zimage.pid"
    fi

    if [ -n "$pid" ] && is_alive "$pid"; then
        kill -TERM "$pid" 2>/dev/null || true
        if ! wait_for_process_exit "$pid" "$STOP_TIMEOUT"; then
            kill -KILL "$pid" 2>/dev/null || true
            wait_for_process_exit "$pid" 5 || true
            SVC_MESSAGE[$name]="已强制停止"
        else
            SVC_MESSAGE[$name]="已停止"
        fi
        wait "$pid" 2>/dev/null || true
        SVC_STATUS[$name]="stopped"
        log_ok "$name 已停止"
    else
        SVC_STATUS[$name]="stopped"
        SVC_MESSAGE[$name]="未运行或已停止"
        log_warn "$name 未运行或已停止"
    fi

    [ -n "$pidfile" ] && rm -f "$pidfile"
    unset "SVC_PID[$name]"
}

# ============================================
# 溶图服务管理函数
# ============================================

start_rongtu() {
    local port=$1
    local gpu=${PORT_GPU_MAP[$port]}
    local original_name="ComfyUI:$port"
    local rongtu_name="RongTu:$port"
    local logfile="$LOG_DIR/rongtu_${port}.log"
    local pidfile="$PID_DIR/rongtu_${port}.pid"
    
    # 关键：立即记录端口号，防止后续被覆盖
    log_info "=== 溶图切换请求: 端口 $port ==="
    
    # === 前置检查 ===
    
    # 1. 检查端口是否有效
    if [ -z "$gpu" ]; then
        log_err "未知端口: $port"
        return 1
    fi
    
    # 2. 检查是否已跳过
    if is_skipped_port "$port"; then
        log_warn "端口 $port 已跳过，无法用于溶图"
        return 1
    fi
    
    # 3. 检查该端口是否已经是溶图
    set +u
    local __rt_dup="${RONGTU_MAPPING[$port]:-}"
    set -u
    if [ -n "$__rt_dup" ]; then
        log_warn "端口 $port 当前已是溶图服务，无需重复启动"
        return 1
    fi
    
    # 4. 关键：只接受脚本启动的 running 状态服务
    local current_status="${SVC_STATUS[$original_name]:-unknown}"
    
    # 检查服务是否存在于脚本管理中
    if [ "$current_status" = "unknown" ]; then
        log_err "端口 $port 未纳入脚本管理（不在 PORT_GPU_MAP 中或已被 SKIP_PORTS 跳过）"
        return 1
    fi
    
    # 只接受 running 状态，拒绝 error/timeout/stopped/starting
    if [ "$current_status" != "running" ]; then
        log_err "端口 $port 当前状态为 [$current_status]，只接受 running 状态的服务进行溶图切换"
        return 1
    fi
    
    # 5. 停止原 ComfyUI 服务
    log_info "正在停止 $original_name 以切换为溶图..."
    stop_service "$original_name"
    
    # 6. 等待端口释放
    log_info "等待端口 $port 释放..."
    if ! wait_for_port_free "$port" "$PORT_RELEASE_TIMEOUT"; then
        log_err "端口 $port 在 ${PORT_RELEASE_TIMEOUT}s 内未释放"
        return 1
    fi
    
    # === 启动溶图 ===
    
    # 关键：保存端口到只读变量，防止后续被覆盖
    local readonly_target_port="$port"
    local readonly_target_gpu="$gpu"
    local readonly_target_original="$original_name"
    local readonly_target_rongtu="$rongtu_name"
    
    : > "$logfile"
    SVC_STATUS[$readonly_target_rongtu]="starting"
    SVC_MESSAGE[$readonly_target_rongtu]="溶图启动中 (GPU $readonly_target_gpu)"
    SVC_START_TIME[$readonly_target_rongtu]=$(date +%s)
    
    # 关键：特殊 conda 激活流程
    (
        cd "$RONGTU_DIR" || { echo "目录不存在: $RONGTU_DIR" >> "$logfile"; exit 1; }
        
        # source anaconda3 的 activate 脚本并激活指定环境
        source "$RONGTU_ANACONDA_PATH/etc/profile.d/conda.sh" 2>/dev/null || source "${RONGTU_ANACONDA_PATH}/bin/activate" 2>/dev/null || true
        conda activate "$RONGTU_CONDA_ENV" 2>>"$logfile" || true
        
        # 禁用 Python 输出缓冲，让日志尽快落盘
        export PYTHONUNBUFFERED=1
        
        export CUDA_VISIBLE_DEVICES=$readonly_target_gpu
        log_info "溶图子进程: 启动端口 $readonly_target_port (GPU $readonly_target_gpu)"
        exec python main.py --listen 0.0.0.0 --port "$readonly_target_port" >> "$logfile" 2>&1
    ) &
    local pid=$!
    echo "$pid" > "$pidfile"
    SVC_PID[$readonly_target_rongtu]=$pid
    
    # HTTP 健康检查循环
    local waited=0
    local ready=0
    
    while [ $waited -lt $START_TIMEOUT ]; do
        if ! is_alive "$pid"; then
            SVC_STATUS[$readonly_target_rongtu]="error"
            SVC_MESSAGE[$readonly_target_rongtu]="进程意外退出"
            rm -f "$pidfile"
            return 1
        fi
        
        if is_comfyui_ready "$logfile"; then
            ready=1
            break
        fi
        
        sleep 1
        ((++waited))
        SVC_MESSAGE[$readonly_target_rongtu]="溶图启动中 ${waited}s/${START_TIMEOUT}s"
        
        draw_dashboard
    done
    
    if [ $ready -eq 1 ]; then
        SVC_STATUS[$readonly_target_rongtu]="running"
        SVC_MESSAGE[$readonly_target_rongtu]="溶图运行中 (耗时 ${waited}s)"
        set +u
        RONGTU_MAPPING[$readonly_target_port]="$readonly_target_original"  # 记录映射关系
        set -u
        # 关键：明确使用 $readonly_target_port 变量，防止日志输出错误
        log_ok "溶图已在端口 ${readonly_target_port} 启动（原服务: ${readonly_target_original}）"
        return 0
    else
        SVC_STATUS[$readonly_target_rongtu]="timeout"
        SVC_MESSAGE[$readonly_target_rongtu]="溶图启动超时"
        if is_alive "$pid"; then
            kill -TERM "$pid" 2>/dev/null || true
            sleep_tick 2
            is_alive "$pid" && kill -KILL "$pid" 2>/dev/null || true
        fi
        rm -f "$pidfile"
        log_err "溶图启动失败，尝试恢复原服务..."
        
        # 尝试恢复原 ComfyUI
        start_comfyui "$readonly_target_port" "$readonly_target_gpu" || true
        return 1
    fi
}

# ============================================
# Z-Image 服务管理
# ============================================

start_zimage() {
    local logfile="$LOG_DIR/zimage.log"
    local pidfile="$PID_DIR/zimage.pid"
    local name="$ZIMAGE_NAME"
    
    : > "$logfile"
    SVC_STATUS[$name]="starting"
    SVC_MESSAGE[$name]="Z-Image 启动中 (GPU $ZIMAGE_GPU)"
    SVC_START_TIME[$name]=$(date +%s)
    
    # 获取 Python 路径
    local python_bin
    if ! python_bin=$(resolve_conda_python "$ZIMAGE_ENV"); then
        SVC_STATUS[$name]="error"
        SVC_MESSAGE[$name]="未找到 Z-Image Conda 环境"
        echo "ERROR: 未找到 Conda 环境 $ZIMAGE_ENV" >> "$logfile"
        return 1
    fi
    
    # 启动 Z-Image 进程
    (
        cd "$ZIMAGE_DIR" || { echo "目录不存在: $ZIMAGE_DIR" >> "$logfile"; exit 1; }
        
        # source conda 并激活环境
        source "$CONDA_HOME/etc/profile.d/conda.sh" 2>/dev/null || source "${CONDA_HOME}/bin/activate" 2>/dev/null || true
        conda activate "$ZIMAGE_ENV" 2>>"$logfile" || true
        
        # 禁用 Python 输出缓冲
        export PYTHONUNBUFFERED=1
        
        export CUDA_VISIBLE_DEVICES=$ZIMAGE_GPU
        exec "$python_bin" app.py --listen 0.0.0.0 --port 8888 >> "$logfile" 2>&1
    ) &
    local pid=$!
    echo "$pid" > "$pidfile"
    SVC_PID[$name]=$pid
    
    # 等待启动就绪
    local waited=0
    local ready=0
    while [ $waited -lt $START_TIMEOUT ]; do
        if ! is_alive "$pid"; then
            SVC_STATUS[$name]="error"
            SVC_MESSAGE[$name]="进程意外退出"
            rm -f "$pidfile"
            return 1
        fi
        
        # 检查日志中是否有启动成功标志（Z-Image 的标志是 Running on）
        if [ -f "$logfile" ] && grep -qF 'Running on' "$logfile" 2>/dev/null; then
            ready=1
            break
        fi
        
        sleep 1
        ((++waited))
        SVC_MESSAGE[$name]="Z-Image 启动中 ${waited}s/${START_TIMEOUT}s"
        draw_dashboard
    done
    
    if [ $ready -eq 1 ]; then
        SVC_STATUS[$name]="running"
        SVC_MESSAGE[$name]="Z-Image 运行中 (${waited}s)"
        log_ok "Z-Image 启动成功"
        return 0
    else
        SVC_STATUS[$name]="timeout"
        SVC_MESSAGE[$name]="Z-Image 启动超时"
        if is_alive "$pid"; then
            kill -TERM "$pid" 2>/dev/null || true
            sleep_tick 2
            is_alive "$pid" && kill -KILL "$pid" 2>/dev/null || true
        fi
        rm -f "$pidfile"
        log_err "Z-Image 启动失败"
        return 1
    fi
}

stop_rongtu() {
    local port=$1
    local rongtu_name="RongTu:$port"
    set +u
    local original_name="${RONGTU_MAPPING[$port]:-}"
    set -u
    
    # === 前置检查 ===
    
    # 1. 检查端口是否有溶图服务
    if [ -z "$original_name" ]; then
        log_err "端口 $port 当前不是溶图服务"
        return 1
    fi
    
    local gpu=${PORT_GPU_MAP[$port]}
    
    # 2. 停止溶图服务
    log_info "正在停止溶图服务（端口 $port）..."
    stop_service "$rongtu_name"
    
    # 3. 等待端口释放
    log_info "等待端口 $port 释放..."
    if ! wait_for_port_free "$port" "$PORT_RELEASE_TIMEOUT"; then
        log_err "端口 $port 在 ${PORT_RELEASE_TIMEOUT}s 内未释放"
        # 清理映射关系（即使恢复失败也要清空）
        set +u
        unset "RONGTU_MAPPING[$port]"
        set -u
        return 1
    fi
    
    # 4. 恢复原 ComfyUI 服务
    log_info "正在恢复 $original_name ..."
    if start_comfyui "$port" "$gpu"; then
        log_ok "已恢复 $original_name"
    else
        log_err "恢复 $original_name 失败，请手动重启"
    fi
    
    # 5. 清理映射关系
    set +u
    unset "RONGTU_MAPPING[$port]"
    set -u
    return 0
}

handle_command() {
    local cmd="$1"
    local arg="$2"

    case "$cmd" in
            rr|RR)
            # 启动溶图（添加错误捕获，避免脚本退出）
            if [ -z "$arg" ]; then
                log_err "用法: rr <端口>  (例如: rr 8234)"
                return
            fi
            if ! start_rongtu "$arg"; then
                log_err "溶图启动失败，请查看日志: logs/rongtu_${arg}.log"
            fi
            ;;
        rs|RS)
            # 停止溶图并恢复原服务（添加错误捕获）
            if [ -z "$arg" ]; then
                log_err "用法: rs <端口>  (例如: rs 8234)"
                return
            fi
            if ! stop_rongtu "$arg"; then
                log_err "停止溶图失败"
            fi
            ;;
        r|R)
            if [ -z "$arg" ]; then
                log_err "用法: r <端口>  (例如: r 8232)"
                return
            fi
            local name="ComfyUI:$arg"
            
            # 检查该端口是否是溶图
            set +u
            local __is_rt="${RONGTU_MAPPING[$arg]:-}"
            set -u
            if [ -n "$__is_rt" ]; then
                log_warn "端口 $arg 当前是溶图服务，请使用 'rs $arg' 停止溶图"
                return
            fi
            
            if [ -z "${PORT_GPU_MAP[$arg]:-}" ]; then
                log_err "未知端口: $arg"
                return
            fi
            if is_skipped_port "$arg"; then
                log_warn "端口 $arg 已配置在 SKIP_PORTS 中，未纳入管理；如需启动请先从 SKIP_PORTS 移除"
                return
            fi
            log_info "正在重启 $name ..."
            stop_service "$name"
            log_info "等待端口 $arg 释放..."
            if ! wait_for_port_free "$arg" "$PORT_RELEASE_TIMEOUT"; then
                log_err "端口 $arg 在 ${PORT_RELEASE_TIMEOUT}s 内未释放，取消重启以避免端口冲突"
                return
            fi
            if start_comfyui "$arg" "${PORT_GPU_MAP[$arg]}"; then
                log_ok "$name 重启成功"
            else
                log_err "$name 重启失败"
            fi
            ;;
        s|S)
            if [ -z "$arg" ]; then
                log_err "用法: s <端口>  (例如: s 8232)"
                return
            fi
            
            # 检查该端口是否是溶图
            set +u
            local __is_rt2="${RONGTU_MAPPING[$arg]:-}"
            set -u
            if [ -n "$__is_rt2" ]; then
                log_warn "端口 $arg 当前是溶图服务，请使用 'rs $arg' 停止溶图"
                return
            fi
            
            if [ -z "${PORT_GPU_MAP[$arg]:-}" ]; then
                log_err "未知端口: $arg"
                return
            fi
            if is_skipped_port "$arg"; then
                log_warn "端口 $arg 已配置在 SKIP_PORTS 中，未纳入管理"
                return
            fi
            stop_service "ComfyUI:$arg"
            ;;
        z|Z)
            if [ "$ENABLE_ZIMAGE" = "true" ]; then
                log_info "正在重启 Z-Image ..."
                stop_service "$ZIMAGE_NAME"
                sleep_tick 2
                start_zimage
            else
                log_warn "Z-Image 在当前环境中已禁用"
            fi
            ;;
        k|K)
            log_warn "强制停止所有服务..."
            for name in "${!SVC_PID[@]}"; do
                stop_service "$name"
            done
            ;;
        q|Q)
            cleanup_all
            ;;
        *)
            log_err "未知指令: $cmd"
            ;;
    esac
}

read_dashboard_command() {
    local __result_var=$1
    local input=""

    # 非交互环境（nohup / screen / systemd 后台运行）没有 tty。
    # 此时不能用 read（会立即返回，让主循环变 CPU 100% 死转），
    # 退化为按 REFRESH_INTERVAL 阻塞 sleep，仅刷新面板。
    if [ ! -t 0 ]; then
        sleep "$REFRESH_INTERVAL"
        return 1
    fi

    if IFS= read -r -t "$REFRESH_INTERVAL" input; then
        printf -v "$__result_var" '%s' "$input"
        return 0
    fi

    return 1
}

# ============================================
# 【阶段 4：主入口】
# ============================================

check_bash_version() {
    # 关联数组依赖 Bash 4.0+；空数组在 set -u 下安全展开依赖 Bash 4.4+。
    # Ubuntu 18.04+ 默认 Bash 4.4+，预期可直接通过。
    local major=${BASH_VERSINFO[0]:-0}
    local minor=${BASH_VERSINFO[1]:-0}
    if [ "$major" -lt 4 ] || { [ "$major" -eq 4 ] && [ "$minor" -lt 4 ]; }; then
        die "需要 Bash 4.4 或更高版本（当前: ${BASH_VERSION:-未知}）"
    fi
}

preflight() {
    [ -d "$COMFYUI_DIR" ] || die "ComfyUI 目录不存在: $COMFYUI_DIR"
    
    # 验证溶图环境（始终检查，因为可能随时启用）
    [ -d "$RONGTU_DIR" ] || die "溶图 ComfyUI 目录不存在: $RONGTU_DIR"
    resolve_conda_python "$RONGTU_CONDA_ENV" >/dev/null \
        || die "未找到溶图 Conda 环境: $RONGTU_CONDA_ENV"
    
    # 只在启用 Z-Image 时检查 Z-Image 相关配置
    if [ "$ENABLE_ZIMAGE" = "true" ]; then
        [ -d "$ZIMAGE_DIR" ]  || die "Z-Image 目录不存在: $ZIMAGE_DIR"
        resolve_conda_python "$ZIMAGE_ENV" >/dev/null \
            || die "未找到 Z-Image Conda 环境 Python: $ZIMAGE_ENV，请检查 CONDA_HOME 或环境名"
    fi
    
    resolve_conda_python "$COMFYUI_ENV" >/dev/null \
        || die "未找到 ComfyUI Conda 环境 Python: $COMFYUI_ENV，请检查 CONDA_HOME 或环境名"
}

main() {
    check_bash_version
    preflight

    # 阶段 2：串行启动
    launch_all

    # 强制同步一次表格与底部 GLOBAL_MSG（避免启动阶段防抖漏最后状态）
    draw_dashboard --force
    printf "命令> "

    # 进入监控面板（每秒轮询：满足「最长 5s 周期」+「SVC_STATUS 变化立即刷新」）
    while true; do
        local input=""
        local got_line=0

        if [ -t 0 ]; then
            local _tick
            for ((_tick = 0; _tick < REFRESH_INTERVAL; _tick++)); do
                if IFS= read -r -t 1 input; then
                    got_line=1
                    break
                fi
                if dashboard_should_redraw; then
                    printf "\r\033[K"
                    draw_dashboard
                    printf "命令> "
                fi
            done
        else
            local _t2
            for ((_t2 = 0; _t2 < REFRESH_INTERVAL; _t2++)); do
                sleep 1
                if dashboard_should_redraw; then
                    draw_dashboard
                fi
            done
        fi

        if [ "$got_line" = 1 ]; then
            printf "\r\033[K"
            local cmd="" arg=""
            read -r cmd arg <<< "$input" || true
            handle_command "$cmd" "$arg"
            draw_dashboard --force
            printf "命令> "
        fi

        check_ssh_session
    done
}

main "$@"