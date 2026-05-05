# 主题设计文档 / Theme Spec — `energy-storage-showcase`

> **已实现**。本主题包位于 `packages/theme-energy-storage-showcase/`，需在 `packages/validators`、`apps/site-builder` registry 与各主题契约中保持一致。治理规则见 `.cursor/rules/20-theme-naming-and-governance.mdc` 与 `.cursor/rules/70-framework-change-workflow.mdc`。

## 1. 主题基本信息

| 字段 | 值 |
| --- | --- |
| Theme ID | `energy-storage-showcase` |
| 中文名称 | 储能案例展示主题 |
| 包目录 | `packages/theme-energy-storage-showcase` |
| CSS 根类 | `.theme-energy-storage-showcase` |
| CSS 前缀 | `.energy-storage-*` |
| Site config | `theme: "energy-storage-showcase"` |
| **登记表状态** | **`active`**（见 `docs/registries/theme-registry.md`「当前主题」表及 ESS 小节） |

> 前缀与主题 ID 的映射：样式类前缀 `energy-storage-*` 表示 `energy-storage-showcase` 的视觉命名空间，所有规则均在 `.theme-energy-storage-showcase` 下 scope。

## 2. 定位与适用场景

- B2B 工业能源、储能系统集成、电池舱 / 机柜类产品站。
- 首屏：**全屏轮播 Hero**（`hero` · `fullscreen-carousel`）与 **产品 Hero**（`hero` · `product-hero`，含锚点 Tabs）。
- 长页叙事：**滚动揭示场景卡片**（`feature-list`，ESS 中为 `ScrollRevealShowcase` 呈现）、图文、统计与公司介绍组合、案例栅格。
- 转化：**FAB**（`floatingActions`）与多列 **Footer**（`footerColumns`）由站点配置驱动，组件内不写死企业与联系方式。

不适合：纯消费品牌情绪化视觉、极简单页且无产品结构的站点。

## 3. Header / Footer / FAB

- **Header**：`client:load` 岛件，sticky、语言切换、`buildLocalizedPath` 后的导航。
- **Footer**：继承 `FooterProps`（来自 `theme-enterprise` 的类型契约），渲染 `footerColumns`、法务链接与 `floatingActions` 底部的 `FloatingActionButtons`。
- **FAB**：`enquiry` / `document` / `support` / `backToTop` 四类快捷入口；`label` / `ariaLabel` 支持 **`LocalizedLabelSchema`**（在 `SiteLayout` 中按 locale resolve 后传入主题）。

## 4. Section 映射要点（与各主题一致的契约）

| Section type | ESS 组件说明 |
| --- | --- |
| `hero` | `fullscreen-carousel`：`FullScreenHeroCarousel`（SectionRenderer 占位，主要由 SectionBlock `client:visible` 挂载）；默认 / `plain`：`Hero` |
| `hero` · `product-hero` | `ProductHero`（含从 `tabs[].href` 解析的页内 **`#fragment` 锚点** div，供 Footer / 站内链接跳转）；需要时配合 `ProductSolutionTabs` |
| `feature-list`（场景橱窗） | 默认：`ScrollRevealShowcase`（滚动揭示卡片 + 移动端轮播）。`variant: "scroll-mask-carousel"`：`ScrollMaskRevealCarousel`（白幕 + 圆角菱形视窗滚动揭示 + 底层持续轮播大图，`SectionBlock` `client:visible` 挂载） |
| `stats` · 含 intro / aboutCta | `CompanyIntroStats` |
| `case-studies` · 含 CTA | `NewsActivityGrid` |
| `image-text` / `services-grid` / `gallery` / `contact-*` / 等 | 与其它主题相同的类型名对应 ESS 独占样式 |
| `contact-form` | `ContactForm`；可选 JSON 字段 **`fieldLabels`**（各 locale 页面分别提供中英标签，`/api/lead` 字段名不变） |

若未来新增全局 section type，须按 `70-framework-change-workflow` 补齐所有主题的回退或实现。

## 5. 资源与占位

站点图片使用 `sites/<slug>/assets/` 与页面 JSON 中 `"/assets/..."` 路径；主题包内不得硬编码公司经营数据或真实客户背书。

## 6. 复用验证（升格 `active` 的依据）

以下条件用于将本主题从「仅实现」晋升为登记表 **`active`**：**双站点引用** + **单站校验/构建** + **全库 `build-all`** 均无失败（FACTORY v1 既有管线，未改架构）。

| 验证项 | 命令 | 预期 |
| --- | --- | --- |
| 站点 A 校验 | `pnpm site validate energy-storage-enclosure` | `Site "energy-storage-enclosure" is valid.` |
| 站点 A 构建 | `pnpm site build energy-storage-enclosure` | `Site "energy-storage-enclosure" built successfully` |
| 站点 B 校验 | `pnpm site validate energy-storage-test-company` | `Site "energy-storage-test-company" is valid.` |
| 站点 B 构建 | `pnpm site build energy-storage-test-company` | `Site "energy-storage-test-company" built successfully` |
| 全站构建 | `pnpm site build-all` | 所列全部 `sites/<slug>/` **依次** `built successfully`，进程 **exit code 0** |

> **说明**：`energy-storage-test-company` 为 **`energy-storage-showcase`** 的第二座复用脚手架站（产品与文案与 `energy-storage-enclosure` 刻意错位）；两站均需保持 **`theme: "energy-storage-showcase"`** 以供回归。本节命令应在主题或站点内容变更后**重复执行**，失败则应在登记表或本文档加注风险后再对外宣称 `active`。

### 最近一次登记时的工程侧依据（可追溯）

以下内容在 **2026-05-04**（主题登记表升格 `active` 当次会话）已通过同一套命令复核（与工作区一致的 `pnpm site` 入口；整套命令链路 **exit code 0**）：

- `pnpm site validate energy-storage-enclosure`
- `pnpm site validate energy-storage-test-company`
- `pnpm site build energy-storage-enclosure`
- `pnpm site build energy-storage-test-company`
- `pnpm site build-all`（遍历当前仓库注册的全部站点，含上述两站）

具体终端完整输出可由执行 environment 留存；本条为登记表与主题文档的一致性记录，**不以修改主题源码为前提**。

## Manual Site Template

FACTORY v1 **已存在**面向本主题的**手工站点模板**，目录：`templates/energy-storage-showcase/`（内含 `site.config.template.ts`、中英 `content/**/pages/*.json`、`assets/` 占位图及同目录下的 `README.md` 用法说明）。

**用途约定**

- 供选用 **`energy-storage-showcase`** 主题的新站点**内容与技术结构草稿**，与已通过验证的示例站（如 `energy-storage-enclosure`、`energy-storage-test-company`）页面形态对齐。
- 当前定位为 **FACTORY v1 手工脚手架**（复制与替换占位符后自用），并作为 **将来 v2 多模板选型**的准备资产。
- **不接入** `pnpm site create` 的默认拷贝源；不改变既有「单默认模板 → 复制 → 令牌替换 → 建站」的官方入口。

**Factory v1 冻结约束**

- **不修改** `tools/create-site/create-site.ts`（默认模板仍仅为 `templates/demo-technical-product-showcase/`）。
- **不修改** `pnpm site pipeline` 的步骤与行为（仍为 create → validate → build 的官方管线）。
- **不新增**多模板 CLI 或「按主题选模板」的工厂层开关；本 ESS 模板与工厂代码路径**解耦**，仅存放在 `templates/` 供人工取用。

**推荐工作流**

1. **先**执行 `pnpm site pipeline <siteSlug>`，得到可用的默认脚手架（含有效 `sites/<siteSlug>/site.config.ts` 与示例页）。
2. **再**参照 `templates/energy-storage-showcase/`，按需**覆盖**：`site.config.ts`（将模板文件中令牌替换后与现站合并时注意 `theme: "energy-storage-showcase"`）、`content/` 全量或按页、`assets/`。
3. **或**：将 `templates/energy-storage-showcase/` **整份人工复制**到 `sites/<siteSlug>/`（将 `site.config.template.ts` 重命名为 `site.config.ts` 并完成令牌替换、`slug` / 登记表等站内治理），随后执行 **`pnpm site validate <siteSlug>`** 与 **`pnpm site build <siteSlug>`**。

> 本节为文档说明；不改变主题包、不改变 `templates/energy-storage-showcase/` 内容、不涉及 Factory v1 架构调整。
