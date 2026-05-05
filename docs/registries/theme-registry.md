# 主题登记表 / Theme Registry

> 这是 `global-site-factory` 中所有可用主题的唯一登记来源（single source of truth）。
> 新增、删除或调整主题，**都必须**同步更新本文件。
> 详细规则见 `.cursor/rules/50-registry-and-naming.mdc` 与 `.cursor/rules/20-theme-naming-and-governance.mdc`。

## 字段说明

| 列 | 含义 |
| --- | --- |
| 主题 ID | 技术标识，小写 ASCII kebab-case；同时是 `packages/theme-<id>/` 目录名、`site.config.ts` 中的 `theme` 字段值、`apps/site-builder` 主题 registry 的 key。 |
| 中文名称 | 主题的中文叫法，仅展示用途，不进代码。 |
| 包目录 | 工作区相对路径 `packages/theme-<id>`。 |
| CSS 根类 | 挂在 `<body>` 上、用于隔离不同主题样式的根类，固定为 `.theme-<id>`。 |
| CSS 前缀 | 该主题独占的 CSS class 命名前缀；可以是完整 ID（如 `.enterprise-*`）或简写别名（如 `.ims-*`）。简写别名必须在主题文档里注明全称映射。 |
| 适用场景 | 该主题最适合服务的行业 / 业务类型。 |
| 视觉关键词 | 4–6 个关键词，让人一眼看懂这个主题长什么样。 |
| 状态 | `active` / `draft` / `archived`。 |
| 主题文档 | `docs/themes/<id>.md` 路径；如未撰写请加 `(pending)`。 |

`status` 含义：

- `planned` — 已登记，尚未创建主题包，通常还没有加入 validators / site-builder。
- `draft` — 主题包已存在，但还在内部打磨，建议尚未生产使用  。
- `active` — 已经至少被一个站点使用，构建正常。
- `archived` — 已停止维护；本表保留以备追溯，但 `theme` 枚举里应已移除。

---

## 当前主题

| 主题 ID | 中文名称 | 包目录 | CSS 根类 | CSS 前缀 | 适用场景 | 视觉关键词 | 状态 | 主题文档 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `enterprise` | 企业官网主题 | `packages/theme-enterprise` | `.theme-enterprise` | `.enterprise-*` | 工业制造、B2B 服务、传统企业宣传站 | 浅色 / 蓝色主色 / 文字主导 / 结构清晰 / 中性稳重 | `active` | `docs/themes/enterprise.md` (active) |
| `technical-product-showcase` | 科技产品展示主题 | `packages/theme-technical-product-showcase` | `.theme-technical-product-showcase` | `.tps-*` | 智能装备、工业设备、能源设备、模块化产品、B2B 科技产品展示官网 | 深色导航 / 大图首屏 / 技术感 / 产品展示 / 模块化结构 | `draft` | `docs/themes/technical-product-showcase.md` (active) |
| `energy-storage-showcase` | 储能案例展示主题 | `packages/theme-energy-storage-showcase` | `.theme-energy-storage-showcase` | `.energy-storage-*` | 储能系统集成、工商业与源网侧 B2B、机柜外壳 / 电池舱类产品站 | 全屏 Hero 轮播 / 场景橱窗滚动卡片 / FAB + 多列 Footer / 双语文案槽位 | **`active`** | `docs/themes/energy-storage-showcase.md` |

### `energy-storage-showcase` — 状态：**`active`**

- 已满足「**至少两个引用站点** + **validate / build / build-all** 路径稳定通过」的登记表口径（见下方复用验证简述及 `docs/themes/energy-storage-showcase.md` 第 6 节「复用验证」）。
- 视觉与文案仍可按站点迭代；**`active`** 表示**可安全作为生产候选主题**选用，不代表各站点内容已审阅可对外发布。

> 上表中 **`enterprise`、`technical-product-showcase`、`energy-storage-showcase`** 均已：存在 `packages/theme-<id>/`、列入 `packages/validators/src/site-config.schema.ts` 的 `theme` 枚举、写入 `apps/site-builder/src/themes/registry.ts`，并已通过管线内站点的 **`pnpm site validate`** / **`pnpm site build`** 及 **`pnpm site build-all`** 的组合验证。其中 **`technical-product-showcase`** 在登记列为 **`draft`**（视觉与文档仍可迭代，但**不阻断**构建）。**`energy-storage-showcase`** 已升格为 **`active`**，复用依据见 `docs/themes/energy-storage-showcase.md`「复用验证」一节。
>
> ⚠️ 现有 `theme-enterprise` 的 CSS 在历史上曾使用较多全局选择器（`:root`、`body`、`header` 等），仍未完全按 `20-theme-naming-and-governance.mdc` scope 到 `.theme-enterprise`。这是已知 legacy：其它主题通过 **`body.theme-<theme-id>`** 与按需挂载的 JSX 减小串扰风险；若在 **同一 HTML 文档中并行加载多套主题全局 CSS**，仍可能存在体积与特异性层面的叠加，须在后续架构版本中单独论证（不改变 FACTORY v1 管线的前提下，当前仍以「全局 import 多套主题样式表」的现状为准）。


---

## 新增主题须知

1. 走 `.cursor/rules/20-theme-naming-and-governance.mdc` 命名规范选择 ID（小写 kebab-case，禁止中文，禁止 `theme1` / `new-theme` / `beautiful-theme` 这类名字）。
2. 创建包 `packages/theme-<id>/`，导出与 `enterprise` 完全一致的 section 组件契约（详见 `.cursor/rules/70-framework-change-workflow.mdc`）。如视觉无法表达某个 section，必须给降级 fallback。
3. 撰写 `docs/themes/<id>.md`。
4. 把新主题加进 `packages/validators/src/site-config.schema.ts` 中的 `theme` 枚举。
5. 注册到 `apps/site-builder` 的主题 registry 与 SiteLayout / SectionRenderer 分发逻辑。
6. **同时**在本文件追加一行登记，状态先填 `draft`；至少有一个 `active` 站点使用后再改为 `active`。

## 删除 / 归档主题须知

1. 走 `.cursor/rules/60-deletion-workflow.mdc` 的"Theme deletion"清单。
2. 删除 `packages/theme-<id>/` 之前**必须**先把所有引用该主题的站点迁移到别的活跃主题，并在 site-registry 中更新它们的 `主题` 列。
3. 在本文件中**不要直接删行**——状态改为 `archived`，"主题文档"列后面追加 `(archived YYYY-MM)`。
4. 同步从 `packages/validators` 的 `theme` 枚举与 `apps/site-builder` 主题 registry 中移除该 ID。
