# 主题设计文档 / Theme Spec — `technical-product-showcase`

> 这是一份 **设计规范文档**，不是已实现的代码。它定义了一套未来要在 `packages/theme-technical-product-showcase/` 中实现的可复用 UI 框架。状态：`planned`。
> 实现工作必须严格遵循 `.cursor/rules/20-theme-naming-and-governance.mdc`、`.cursor/rules/50-registry-and-naming.mdc`、`.cursor/rules/70-framework-change-workflow.mdc`。

---

## 1. 主题基本信息

| 字段 | 值 |
| --- | --- |
| Theme ID | `technical-product-showcase` |
| 中文名称 | 科技产品展示主题 |
| 包目录 | `packages/theme-technical-product-showcase`（规划中，尚未创建） |
| CSS 根类 | `.theme-technical-product-showcase` |
| CSS 前缀 | `.tps-*`（`tps` 是 `technical-product-showcase` 的别名，仅为缩写便于书写） |
| 状态 | `planned` |
| 主题文档 | `docs/themes/technical-product-showcase.md`（本文件） |
| Site config 用法 | `theme: "technical-product-showcase"` |

> 缩写约定：`.tps-*` = `technical-product-showcase-*`。后续在 `packages/theme-technical-product-showcase/src/styles/theme-technical-product-showcase.css` 顶部必须再写一份 inline 注释复述该映射，以便 grep。

---

## 2. 主题定位

`technical-product-showcase` 是 `global-site-factory` 中的**可复用 UI 框架**，不是任何一个公司的专属网站。它服务于一类共性需求：

- 客户在 60 秒内需要建立**技术信任**（产品看起来扎实、规格看起来真实、案例看起来可验证）。
- 主导内容是**实物产品图 + 规格 + 数据 + 资质**，而不是品牌故事或情绪化文案。
- 客户大多通过 B2B 渠道、外贸搜索引擎、行业展会触达，转化目标是「索取详细资料 / 索取报价」。

它和兄弟主题 `immersive-showcase` 的差异：

- `immersive-showcase`：摄影主导、首屏全开、超大字号、奢华氛围，适合"被产品照片击中"的场景。
- `technical-product-showcase`：模块化网格主导、规格密度高、技术蓝灰冷色，适合"被规格和数据说服"的场景。

两者并列，按目标客户决策路径二选一，**不允许互相 import**。

---

## 3. 适用行业

- 智能装备 / 智能硬件（IoT 设备、机器视觉、AGV、自动化产线模块）
- 工业设备（数控机床、专用机械、检测仪器、电气控制柜）
- 能源设备（储能系统、光伏组件、充电桩、逆变器、户用储能）
- 模块化产品（模块化建筑构件、模块化集装箱、可拼装产品系列）
- B2B 科技产品（工业软件配套硬件、技术型零部件、专用通信模组）
- 外贸制造企业（OEM/ODM 工厂、面向海外采购方的中型制造商）

不适合：纯 SaaS、纯咨询、纯内容站、消费级时尚、视觉强情绪化的行业（请用 `immersive-showcase` 或后续别的主题）。

---

## 4. 视觉关键词

> 深色导航 · 大图首屏 · 技术感 · 模块化结构 · 数据驱动 · 资质背书 · 清晰 CTA · 蓝灰冷色 · 锋利字符 · 网格秩序

不允许出现的视觉元素：糖果色 / 霓虹渐变 / 卡通插画 / 强情绪化 emoji 装饰 / 模糊水印 / 自动轮播图 / 过强阴影。

---

## 5. Header 设计规范

**结构**：左 Logo / 中（或右）导航 / 右 CTA + 搜索图标。

| 项目 | 值 |
| --- | --- |
| 桌面高度 | 80–96px，建议 `--tps-header-height: 88px` |
| 移动高度 | 64–72px，建议 `--tps-header-height-mobile: 64px` |
| 背景 | 深色 `rgba(8, 12, 18, 0.94)`，可加 `backdrop-filter: blur(8px)` |
| 边线 | 底部 1px `--tps-color-border` |
| 定位 | `position: sticky; top: 0; z-index: 50` |
| 桌面栅格 | `grid-template-columns: auto 1fr auto`（brand / nav / actions），nav 居中或右对齐均可 |
| 移动栅格 | `grid-template-areas: "brand actions" "nav nav"`，nav 整行下沉、横向溢出滚动 |

**Brand**：

- 默认渲染 `siteConfig.company.displayName` 文字版（display 字族 + 大写 + 字距 0.04em）。
- 如果 `siteConfig.brand.logo` 存在，渲染 `<img>`，高度上限 `36px`，宽度自适应。
- **不允许**主题包内置任何 Logo 资源；Logo 路径来自站点 `site.config.ts`。

**Nav**：

- 渲染 `siteConfig.navigation` 数组，**禁止**主题内写死菜单项。
- Hover 时下方出现 2px 高、24px 宽的 accent 短线作为强调。

**Actions（右侧）**：

- 一个圆形 ghost 风格搜索图标按钮（40×40，透明底，hover 时变深），用 inline SVG，不引入图标库。
- 可选一个右对齐的主 CTA 按钮（透明描边风格），文案与链接来自 `site.config.ts`（建议未来扩 `headerCta?: { label; href }` 字段，本主题第一版可暂不实现，仅留位）。
- 搜索功能不在主题职责内，仅渲染占位入口。

**响应式**：

- ≤960px：保持桌面三栏，调整间距，nav gap 缩小。
- ≤720px：nav 整行下沉、横向滚动；搜索图标与 brand 同行。

---

## 6. Hero 设计规范

**核心结构**：背景图 + 蓝灰渐变遮罩 + 偏左中位置的内容块 + 可选模块化网格装饰。

| 项目 | 值 |
| --- | --- |
| 容器最小高度 | `min-height: 88vh`（移动端可降到 `72vh`） |
| 背景图 | `background-image: url(<section.image>); background-size: cover; background-position: center`（来自 page JSON，**禁止**主题包硬编码） |
| 遮罩 | 伪元素 `::before`，使用变量 `--tps-overlay-hero`：从顶到底 `rgba(8,12,18,0.50) → 0.65 → 0.88` 的纵向渐变 |
| 装饰 | 伪元素 `::after`（可选），1px 蓝灰网格 SVG 平铺在遮罩之上，强化"技术感"，移动端关闭 |
| 内容容器 | 内容块 `max-width: 720px`，左对齐于容器内，垂直居中 |
| 顶部 padding | `calc(var(--tps-header-height) + var(--tps-space-7))` |
| Eyebrow | 0.78rem，全大写，字距 0.22em，色 `--tps-color-accent-strong` |
| Title | `clamp(2.5rem, 6vw, 5rem)`，字重 700，字距 -0.015em，行高 1.08，白色 |
| Description | `clamp(1rem, 1.3vw, 1.15rem)`，最大宽度 600px，色 `--tps-color-text-muted` |
| Primary CTA | 实心 accent 按钮 + 描边次级按钮可并列（次级未在 schema 中，先支持单 CTA） |

**Hero 字段**（与 validators 中 `HeroSectionSchema` 对齐）：

`type` / `title`（必填）/ `description`（必填）/ `eyebrow`（可选）/ `primaryCta`（可选）/ `image`（可选）/ `imageAlt`（可选）/ `variant`（可选：`standard` \| `split-carousel`）/ `carousel`（可选，见第 6.1 节）。

**降级**：

- 缺 `section.image` 时退回内置渐变 `linear-gradient(135deg, #060a10, #0e1722, #060a10)`，class 加 `tps-hero--no-image`，**不让 hero 塌掉**。
- 缺 `eyebrow` / `primaryCta` 时对应节点不渲染，整体仍为完整 hero。

**可访问性**：

- `<section>` 上挂 `aria-label`，优先 `section.imageAlt`，否则 `section.title`。
- title 永远是 `<h1>`，hero 是页面唯一 h1。

**响应式**：

- ≤720px：title 切到 `clamp(2.25rem, 9vw, 3.25rem)`；description 锁 1rem；网格装饰隐藏；图保持 cover。

### 6.1 Hero `split-carousel` variant

用于**左文右图**首屏：左侧 `eyebrow`、`title`、`description`、`primaryCta`（更靠左、标题大号），右侧**产品图轮播**（自动播放、透视侧翼、圆点、箭头、点击 lightbox）。交互由 `apps/site-builder` 对 `Hero` 使用 **`client:visible`** 做**局部 hydration**（仅当 `variant === "split-carousel"` 且 `carousel.images` 非空时），其余 section 仍静态 SSR。

**配置**（均在 page JSON 的 `hero` section）：

| 字段 | 说明 |
| --- | --- |
| `variant` | 设为 `"split-carousel"` 启用本布局；省略或为 `"standard"` 时沿用第 6 节背景图 Hero。 |
| `carousel.images` | 必填（本 variant 下至少 1 条）。每项：`src`（必填）、`alt` / `title`（可选）。**圆点数量恒等于 `images.length`**。 |
| `carousel.autoplay` | 可选，默认 `true`。 |
| `carousel.intervalMs` | 可选，默认 `4500`。 |
| `carousel.perspective` | 可选，默认 `true`；为 `false` 时侧翼透视减弱，以淡入叠化为主。 |
| `carousel.lightbox` | 可选，默认 `true`；为 `false` 时禁用大图预览。 |
| `image` / `imageAlt` | 仍保留作 **standard** 与降级参考；split-carousel 主视觉以 `carousel.images` 为准。 |

**Lightbox**：点击当前主图打开；_overlay_ 点击或关闭按钮或 `Esc` 关闭；左右箭头与 `←` `→` 切换；多图时在 lightbox 内可循环切换。

**图片与资产**：框架**不会**扫描 `assets/`；所有 URL 须在页面 JSON 中写明（`/assets/...`）。推荐轮播图横宽比约 **4:3 ～ 16:10**，宽边约 **1600–2400px** 便于视网膜屏；过大文件请自行压缩以兼顾性能。

**适用场景**：预制房屋、太空舱、集装箱、拓展箱、打包箱等 **B2B 产品首屏** ，需多图轮播而不新增 section 类型时。

**无障碍**：系统 `prefers-reduced-motion: reduce` 下自动**关闭定时轮播**并缩短过渡依赖。

---

## 7. Section 设计规范

> 主题必须**完整支持** `packages/validators/src/page.schema.ts` 当前定义的 12 种 section。即使视觉上某 section 在本主题里"不那么主角化"，仍要给安全 fallback，不允许 break build。

| Section type | 在 `technical-product-showcase` 下的展示策略 |
| --- | --- |
| `hero` | 默认：第 6 节背景图 Hero。若 `variant: "split-carousel"` 且配置 `carousel.images`，见 **第 6.1 节**（左文右轮播 + lightbox）。 |
| `services-grid` | 深色底，3 列卡片 `.tps-services__item`，卡片底色 `--tps-color-surface`，1px `--tps-color-border-strong` 边线，内 padding `1.75rem`。卡片左上一条 2px 高 / 24px 宽 accent 短线作为类目标记，下面是 h3 标题与正文。**`items[]` 可选 `href`（必须以 `/` 开头的站内路径）**：若存在，整张卡片渲染为可点击链接，hover / focus 有明显反馈，适用于产品类型卡片、方案入口跳转。 |
| `feature-list` | 与 services-grid 同样的卡片基底，但每张卡片可显示 `icon`（字符串：emoji / 几何字符 / 数字编号；主题不引入图标库）。icon 用 `--tps-color-accent-strong`、字号 1.5rem，置于标题上方。强调"特性密度"，建议 6–9 条。 |
| `image-text` | 两栏栅格，960px 以下塌成单栏。图片 `aspect-ratio: 5/4; object-fit: cover; border-radius: var(--tps-radius-md)`。`reverse: true` 时把图放左、文放右；class 加 `tps-image-text--left`。CTA 使用 outline 风格按钮。 |
**Gallery `assetDir`（构建期展开）**：`gallery` 可选 `assetDir`（形如 `/assets/<kebab 路径>`），由 **`packages/site-core` 在 `loadSite` / `validate-site` / `build-site` 阶段**读取 `sites/<siteSlug>/assets/` 下对应一级目录内的图片文件（`.jpg` / `.jpeg` / `.png` / `.webp` / `.avif` / `.svg`），按**自然序**生成完整 `"/assets/.../文件名"` 列表，写入 `apps/site-builder/.generated/pages.json` 中的 **`images` 数组**；`apps/site-builder` **不会**直接扫描 `sites/`。若目录不存在或暂无图片，则 **fallback** 到 JSON 中的 `images`；若仍为空，主题展示空状态。可同时配置 `assetDir` 与 `images`：**优先采用目录扫描结果**；仅当扫描结果为空时使用 `images`。新增或删除图片后需重新执行 `pnpm build-site <siteSlug>`。

| `gallery` | 深色抬升底色（`--tps-color-bg-elev`），默认 **3 列** `.tps-gallery__image`，每张 `aspect-ratio: 4/3; object-fit: cover; border-radius: var(--tps-radius-md)`。≤720px 时标准 gallery 转单列大图。**可选** `layout: "product-grid"`：大图卡片容器 `.tps-gallery__cell`（B2B 产品格可用 hover 提升层次），适合**产品分类页 / 产品示意图墙**；**可选** `columns: 2 \| 3 \| 4`（缺省 `3`，与历史 JSON 行为一致）。`columns: 4` 表示桌面栅格**每行最多 4 列**，**自动换行**，并非限制总张数为 4；`product-grid` 在约 961px 以上保持四列，721–960px 两列，更窄单列。**可选** `imageAspect: "square" \| "landscape" \| "portrait"` 统一裁切比例。**可选** `assetDir`：见上段构建期展开说明；仍可直接写 `images: string[]` 保持兼容。**可选** `lightbox` / `zoom`：见下文 **Gallery lightbox and zoom**。图片加载失败时以占位块呈现，不拖垮整页；无图时展示简短空状态。强调产品/产线实拍，网格本身不做自动轮播。 |

### Gallery lightbox and zoom

1. `gallery` 支持 **`lightbox: true`**：在**构建产出的页面**中 `images` 数组非空时，缩略图可点击打开全屏 lightbox 大图预览（由 `apps/site-builder` 对该 section 使用 **`client:visible`** 做**局部 hydration**；未开启 `lightbox` 的 gallery 仍为静态 SSR，与旧站兼容）。
2. `gallery` 支持 **`zoom: true`**：在 lightbox 内显示 **放大 / 缩小 / 重置** 控件（缩放范围约 1×～3×，步进 0.25；未配置 `zoom` 时仅预览与切换，无缩放控件）。
3. 点击缩略图打开大图预览；**点击遮罩（backdrop）** 或 **关闭按钮** 或 **`Esc`** 关闭。
4. Lightbox 内支持 **左右箭头** 与键盘 **`←` / `→`** 循环切换；序号 **当前张 / 总张数** 会显示（例如 `3 / 9`）。
5. **`assetDir` 在 build 阶段展开**写入 `images` 后，与手写 `images` 行为一致，**同样支持 lightbox**（仍以构建后的 `images.length > 0` 为准）。
6. `columns: 4` **仅表示**桌面栅格每行最多 4 列并自动换行，**不限制**图片总张数。
7. 使用 `assetDir` 或其它方式**新增或删除图片**后，须重新执行 **`pnpm build-site <siteSlug>`**，`.generated` 与静态输出才会更新。
8. 该能力适合 **产品分类页、产品示意图墙、多图技术展示** 等 B2B 场景。
| `case-studies` | 卡片**全宽图 + 下方文字块**两段式。图 `aspect-ratio: 16/10; object-fit: cover`；下方 padding `1.25rem 1.5rem 1.5rem`。`industry / location` 合成一行 meta，全大写字距 0.08em，色 `--tps-color-text-subtle`，置于标题上方。3 张卡片成行；2 张时居中。 |
| `process-steps` | 4 列步骤卡片（小屏 2 列、再小 1 列）。每张卡片左上一个**两位数字**（`01 02 03 04`），display 字族 + 字重 800 + 字号 2.25rem + 色 `--tps-color-accent`，作为视觉序号。下方是 h3 步骤名 + 简短说明。 |
| `stats` | 4 列网格，每个 `.tps-stats__item` 是深色卡片，左对齐。大数字 `clamp(2.25rem, 4vw, 3.25rem)` 字重 800、色 `--tps-color-accent-strong`，下面是 h3 标签和说明。本主题强调统计区是**资质 / 信任建设**的核心。 |
| `faq` | 每个 `<details>` 是一张深色卡片（`--tps-color-surface`，1px 边线，`--tps-radius-sm`）。问题字重 600；展开时使用 CSS `[open]` 旋转一个简易雪佛龙图标。**不要**做手风琴自动收起其他项的逻辑，这会引入 JS。 |
| `certificates` | 与 services-grid 同样的卡片基底，但图片 `aspect-ratio: 4/3; object-fit: contain`（证书图必须完整显示，不允许 cover 裁切），居中对齐，下方是认证名 / 颁发机构。本主题中 certificates 是「资质墙」，建议 4–8 个。 |
| `contact-block` | 单栏，最大宽度 720px。展示 h2 标题 + 描述 + 联系信道列表（每条 `.tps-contact-block__link` 用 accent 色），可选 CTA。`channels` 用 `label: value` 形式排列，邮箱与电话从 `siteConfig.company.email` / `phone` 兜底拼上 mailto: / tel:。 |
| `contact-form` | 深色底，表单容器 `.tps-contact__form` 是深色卡片（`--tps-color-surface`、1px 边线、`--tps-radius-md`），输入框背景 `--tps-color-bg-elev`，focus 时边线变 accent。提交按钮使用主按钮（实心 accent）。表单 action 固定提交到 `/api/lead`，不要在主题里引入第三方 endpoint。 |

**B2B 产品内容边界**：本主题服务于 **工程询盘与规格对话**，而非电商成交。`services-grid` / `gallery` 等区块可用于产品线 overview 与分类落地页，但**不应**在页面或主题文案中呈现价格、购物车、「Buy Now」「Add to Cart」等**店铺式下单**控件；转化应以联系表单、资料索取与项目沟通为主。

> Header 与 Footer 不属于 section，但作为主题契约一部分必须实现：Header 见第 5 节；Footer 用 `--tps-color-bg-elev` 抬升底色 + 顶部 1px `--tps-color-border` 分隔，公司名为 display 字体大写，下方一行链接（隐私 / 条款 / privacyEmail），最下版权字号 0.85rem。

---

## 8. 页面推荐结构

最少必须：`hero + services-grid + contact-form`。其余按业务节奏调度。

### 首页

```
hero
services-grid       ← 3 个核心能力或产品类目
image-text          ← 招牌产品 / 招牌项目深度展示
stats               ← 数据背书：年份、出口国家、产能、专利
case-studies        ← 2~3 个落地案例
process-steps       ← 我们怎么交付（4 步）
certificates        ← 资质墙
faq                 ← 高频问题 4~6 条
contact-form        ← 收线索
```

### 服务页

```
hero
feature-list        ← 6~9 个能力点（icon + 标题 + 一句话）
image-text          ← 招牌服务深度展示，可重复 1~2 次
process-steps       ← 与首页保持一致的 4 步流程
case-studies        ← 与服务相关的案例
faq
contact-form
```

### 关于页

```
hero                ← 厂房 / 团队 / 工艺照
image-text          ← 公司故事
stats               ← 公司规模
process-steps       ← 工作方式 / 价值观
certificates        ← ISO / CE / UL / FCC 等
case-studies        ← 代表性合作
contact-block       ← 简短联系块（不放完整表单，避免与 contact 页冲突）
```

### 联系页

```
hero                ← 简短，可走 tps-hero--no-image
contact-form        ← 完整表单
contact-block       ← 邮箱 / 电话 / WhatsApp / 地址 / 营业时间
faq                 ← 联系前常见问题（"多久回复" / "贸易条款" / "样品政策"）
```

---

## 9. 设计 Token 建议

> 全部以 CSS 变量形式定义在 `.theme-technical-product-showcase` 选择器作用域下。其他主题不会被影响。

### 颜色

```css
.theme-technical-product-showcase {
  --tps-color-bg:           #060a10;   /* 页面底色，近黑偏冷 */
  --tps-color-bg-elev:      #0c131c;   /* 抬升一档：交替 section 底色 */
  --tps-color-surface:      #131e2b;   /* 卡片底色 */
  --tps-color-surface-soft: #1a2636;   /* 卡片 hover / 二级容器 */

  --tps-color-border:        #1e2c3d;
  --tps-color-border-strong: #2c4156;

  --tps-color-text:        #eef3f8;
  --tps-color-text-muted:  #9bb0c5;
  --tps-color-text-subtle: #6c8197;

  --tps-color-accent:           #4aa3ff;  /* 技术蓝主色 */
  --tps-color-accent-strong:    #8cc5ff;  /* hover / 高亮 */
  --tps-color-accent-contrast:  #060a10;  /* accent 底色上的文字 */

  --tps-overlay-hero: linear-gradient(
    180deg,
    rgba(6, 10, 16, 0.50) 0%,
    rgba(6, 10, 16, 0.65) 55%,
    rgba(6, 10, 16, 0.88) 100%
  );
}
```

对比度要求：

- `--tps-color-text` over `--tps-color-bg` ≥ 12:1（AAA）。
- `--tps-color-text-muted` over `--tps-color-bg` ≥ 4.5:1（AA）。
- `--tps-color-accent-strong` over `--tps-color-bg` ≥ 7:1，可作为链接色。
- 任何新增颜色 token 必须先验证对比度。

### 字体

```css
--tps-font-display: "Inter Tight", "Inter", "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
--tps-font-body:    "Inter", "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
--tps-font-mono:    "JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Consolas, monospace;
```

字阶：

| 角色 | 桌面 | 移动 |
| --- | --- | --- |
| Hero title | `clamp(2.5rem, 6vw, 5rem)` | `clamp(2.25rem, 9vw, 3.25rem)` |
| Section title (h2) | `clamp(1.625rem, 2.75vw, 2.25rem)` | `clamp(1.5rem, 5vw, 1.875rem)` |
| Card title (h3) | `1.125rem` | `1.0625rem` |
| Body | `1rem` | `1rem` |
| Eyebrow / Meta | `0.78rem` | `0.78rem` |
| Mono（spec / version） | `0.85rem` | `0.85rem` |

字重：display 700–800、body 400–500、label 600、button 600。**禁止** 100/200/300 细体（深色背景细体易糊）。
字距：display -0.015em；eyebrow / 全大写 +0.22em；body 默认；button +0.02em。

### 间距 / 圆角 / 容器

```css
--tps-space-1: 0.25rem;
--tps-space-2: 0.5rem;
--tps-space-3: 0.75rem;
--tps-space-4: 1rem;
--tps-space-5: 1.5rem;
--tps-space-6: 2rem;
--tps-space-7: 3rem;
--tps-space-8: 4rem;
--tps-space-9: 5.5rem;

--tps-radius-sm: 0.25rem;
--tps-radius-md: 0.5rem;
--tps-radius-lg: 0.75rem;

--tps-container-max: 1240px;
```

使用约定：

- Section 之间 `padding-block: var(--tps-space-9)`（移动端可降到 `--tps-space-7`）。
- 卡片内 padding：`--tps-space-6`。
- 表单控件 gap：`--tps-space-4`。
- Hero 区**不加圆角**（要求 cover 到边）。
- 容器最大宽度 1240px，桌面 padding-inline `2rem`，移动 `1rem`。

---

## 10. CSS 命名规范

- **根类必须是** `.theme-technical-product-showcase`，挂在 `<body>` 上。
- **CSS 前缀必须是** `.tps-*`（`tps` = `technical-product-showcase`，缩写在 CSS 文件顶部 + 本文件中已记录）。
- **所有规则**必须 scope 在 `.theme-technical-product-showcase` 之下，例如：

  ```css
  .theme-technical-product-showcase .tps-hero { ... }
  .theme-technical-product-showcase .tps-services__item { ... }
  ```

- 严禁出现裸的 `body { ... }`、`header { ... }`、`:root { ... }` 这类无 scope 的全局规则。
- 严禁出现以其他主题前缀（`.enterprise-*`、`.ims-*` 等）开头的选择器，主题之间是平级关系。
- BEM 风格：`.tps-<block>`、`.tps-<block>__<element>`、`.tps-<block>--<modifier>`。例：`.tps-hero`、`.tps-hero__title`、`.tps-hero--no-image`。
- 共享原子类（来自 `@factory/ui`）`.factory-container`、`.factory-section`、`.factory-grid`、`.factory-card`、`.factory-button`、`.factory-heading`、`.factory-text` 等仍可使用，但实际样式由本主题在 scope 内重新定义。

---

## 11. 在 `site.config.ts` 中使用

任意已注册站点（参见 `docs/registries/site-registry.md`）只需把 `theme` 字段改成新值：

```ts
import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "<your-site-slug>",
  company: {
    /* legalName / displayName / address / email / phone / whatsapp */
  },
  domain: "https://www.example.com",
  industry: "<行业关键词>",
  theme: "technical-product-showcase",
  // 可选：通过 themeTokens 覆盖颜色（HEX），不修改主题包代码
  themeTokens: {
    colorAccent: "#3aa8ff",
    colorBackground: "#080d14"
  },
  // 可选：站点 Logo
  brand: {
    logo: "/assets/logo.svg",
    logoAlt: "<alt 文本>"
  },
  locales: ["en"],
  defaultLocale: "en",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ],
  seo: { /* defaultTitle / titleTemplate / defaultDescription */ },
  legal: { /* privacyEmail / dataController */ },
  deploy: { provider: "cloudflare-pages", projectName: "<your-site-slug>" }
});
```

> 当前 `site.config.ts` 的 `theme` 字段是 `z.literal("enterprise")`，要让上面这段配置生效，需先按 `.cursor/rules/70-framework-change-workflow.mdc` 把 `technical-product-showcase` 加进 `theme` 枚举、并在 `apps/site-builder` 主题 registry 中注册。本文档不执行这些代码改动（按用户当前要求）。

> `themeTokens` / `brand` 字段同样需要 schema 支持后才能生效；未启用前请勿在 `site.config.ts` 写入。

---

## 12. 不同官网如何复用该主题

**同一份 `packages/theme-technical-product-showcase` 服务任意多个公司站点**。每个站点之间的差异**仅通过站点级数据**表达：

| 差异类型 | 实现方式 |
| --- | --- |
| 公司信息 / 法务信息 / 联系方式 | `sites/<siteSlug>/site.config.ts` 中的 `company` / `legal` |
| 导航 | `site.config.ts` 中的 `navigation` |
| Logo | `site.config.ts` 中的 `brand.logo` 指向 `/assets/<filename>`，文件放在 `sites/<siteSlug>/assets/` |
| 主色 / 次色 / 文字色 / 背景色 | `site.config.ts` 中的 `themeTokens`（HEX） |
| Hero 大图 / Gallery 图 / Image-text 图 / Case 图 / Cert 图 | `sites/<siteSlug>/content/<locale>/pages/*.json` 中各 section 的 `image` / `images`，路径形式 `/assets/<filename>` |
| 文案 | 同上，section JSON 字段（title / description / items 等） |
| Page 排版顺序 | `pages/*.json` 中 `sections[]` 的顺序 |
| 多语言 | `content/<locale>/pages/*.json` 多份，`site.config.ts` 中 `locales` 列出 |

**严禁**在 `packages/theme-technical-product-showcase/` 内：

- 写任何具体公司名、邮箱、电话、地址、Logo 路径、产品图路径、营销文案。
- 加任何形如 `if (siteConfig.slug === "...")` 的分支，即按站点 slug 切换渲染。
- 引用 `sites/<siteSlug>/assets/` 下的具体文件（资产引用必须通过 `/assets/...` 公共路径，由站点 JSON 负责）。

详细约束见 `.cursor/rules/20-theme-naming-and-governance.mdc`。

---

## 13. 后续微调规则

| 想做的事 | 该改哪里 |
| --- | --- |
| Header 高度 / 颜色 / nav 间距 | `packages/theme-technical-product-showcase/src/styles/theme-technical-product-showcase.css` 与 `src/components/Header.tsx` |
| Hero 遮罩浓度 / title 字号 / CTA 风格 | 同上（CSS + `Hero.tsx`） |
| 任意 section 的卡片样式 / 网格列数 / 内边距 | 同上 |
| 全主题颜色基调 | 改 `--tps-color-*` token |
| 全主题间距节奏 | 改 `--tps-space-*` token |
| 加新 section 类型（例如 pricing、team、logo-wall） | 走 `.cursor/rules/70-framework-change-workflow.mdc` 的通用框架变更：先在 `packages/validators/src/page.schema.ts` 加 schema → 在每个主题（包括本主题）补组件或安全 fallback → 在 `apps/site-builder/src/components/SectionRenderer.tsx` 加 case → 更新所有主题的 `docs/themes/<id>.md`。 |
| 单独一个公司想要不同主色 | **不要改主题**。在那个站点的 `site.config.ts` 里写 `themeTokens.colorAccent` |
| 单独一个公司想要不同 Logo | 在 `site.config.ts` 写 `brand.logo`，把文件放到 `sites/<siteSlug>/assets/` |
| 单独一个公司想要不同 hero 图 | 改它的 `pages/home.json` 中 hero section 的 `image` 字段 |

> **核心原则**：影响"所有用此主题的站"的改动，改主题包；影响"单一站"的改动，改那个站的 `site.config.ts` 或 page JSON。两者绝不互换。

---

## 14. 禁止事项

- ❌ 不要在主题组件中写死任何具体公司名（`Acme Manufacturing`、`Beta SaaS` 等）。
- ❌ 不要在主题包内嵌入任何具体 Logo 文件（无论 SVG / PNG / WebP）。Logo 必须经由 `site.config.ts.brand.logo` 注入。
- ❌ 不要在主题组件中写死任何具体导航文字（`Home` / `Products` / `About` / `Contact` 等）。导航来自 `site.config.ts.navigation`。
- ❌ 不要在主题组件中写死任何具体邮箱、电话、WhatsApp、地址。这些来自 `site.config.ts.company` 与 `site.config.ts.legal`。
- ❌ 不要在主题组件中写任何具体营销文案 / Slogan / 卖点描述。文案来自 `pages/*.json`。
- ❌ 不要直接 import / fetch / require `sites/<siteSlug>/assets/...` 下的具体文件。资产由站点 JSON 通过 `/assets/...` 路径引用，构建脚本负责复制。
- ❌ 不要为本主题引入 Tailwind 或任何 utility-CSS 框架。
- ❌ 不要为本主题接 Headless CMS / 数据库 / 远程内容源。所有数据来自 `sites/<siteSlug>/`。
- ❌ 不要修改 `apps/site-builder` 让 Astro 直接读 `sites/`。Astro 永远只读 `apps/site-builder/.generated/`。
- ❌ 不要为本主题引入轮播图 / 自动播放视频 hero / 弹窗式订阅 / 任何 cookie banner 之外的拦截层。
- ❌ 不要 import 任何兄弟主题包（`@factory/theme-enterprise` 等）。主题之间是平级关系。

---

## 关联规则

- `.cursor/rules/10-site-factory-architecture.mdc` — 项目目录职责
- `.cursor/rules/20-theme-naming-and-governance.mdc` — 主题命名与治理
- `.cursor/rules/40-no-go-rules.mdc` — 全局禁止项
- `.cursor/rules/50-registry-and-naming.mdc` — 命名规范与必备 registry
- `.cursor/rules/60-deletion-workflow.mdc` — 主题删除流程
- `.cursor/rules/70-framework-change-workflow.mdc` — 框架级变更（含新增 section）
- `.cursor/rules/80-cloudflare-and-leads.mdc` — Cloudflare Pages 与 Lead 处理
- `docs/naming-conventions.md` — 命名约定
- `docs/site-and-theme-workflow.md` — 站点 / 主题工作流
- `docs/registries/theme-registry.md` — 主题登记表（待补 `planned` 行）
