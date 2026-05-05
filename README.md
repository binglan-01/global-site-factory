**global-site-factory — 站点工厂 CLI**

本站点的唯一官方运维入口：`pnpm site`（子命令见 `docs/site-and-theme-workflow.md` 与 `.cursor/rules/30-new-site-workflow.mdc`）。**Architecture Freeze（v1 定版）** 见 `docs/factory-v1-final-spec.md`；**维护期治理（允许/禁止与 v2 触发）** 见 `docs/factory-v1-maintenance-governance.md`。不要在日常流程中使用 `pnpm exec tsx scripts/...`。

---

**使用方法：**



脚本第一次使用前需要执行：

\# 移除所有 \\r 字符

sed -i 's/\\r$//' run\_cluster.sh

\# 重新赋予执行权限

chmod 755 run\_cluster.sh



\# 运行脚本

bash run\_cluster.sh





后续所有执行直接运行下方命令即可（无论是否通过vim修改）

\# 运行脚本

bash run\_cluster.sh





**脚本调试：**

生产测试环境做了快捷切换设置：

通过vim命令打开文件，修改下方变量即可快捷切换生产环境与测试环境



\# ============================================

\# 环境切换：修改下面的 ENV\_MODE 变量

\#   - ENV\_MODE="test"     # 测试环境

\#   - ENV\_MODE="prod"     # 生产环境

\# ============================================

ENV\_MODE="test"  # 当前使用：测试环境



