# 站点登记表 / Site Registry

> 这是 `global-site-factory` 中所有公司站点的唯一登记来源（single source of truth）。
> 任何 `sites/<siteSlug>/` 的创建、删除或状态变更，**都必须**同步更新本文件。
> 详细规则见 `.cursor/rules/50-registry-and-naming.mdc` 与 `.cursor/rules/30-new-site-workflow.mdc`。

## 字段说明

| 列 | 含义 |
| --- | --- |
| `siteSlug` | 技术标识，小写 ASCII kebab-case；同时是 `sites/<slug>/` 目录名、`site.config.ts` 中的 `slug`、Cloudflare Pages Project 名称。 |
| 中文名称 | 仅作展示与沟通用途，不进入任何代码与配置。 |
| English display name | `site.config.ts` 中的 `company.displayName`。 |
| 法人主体 | `site.config.ts` 中的 `company.legalName`。 |
| 行业 | `site.config.ts` 中的 `industry`。 |
| 主题 | `site.config.ts` 中的 `theme`，对应 `docs/registries/theme-registry.md` 中已登记的 theme ID。 |
| 域名 | 真实生产域名；多语言子站请在备注列说明。 |
| Cloudflare Project | Cloudflare Pages Project 名称，建议与 `siteSlug` 一致。 |
| 状态 | `active` / `staging` / `test` / `archived` / `planned`。 |
| 用途 | 一句话说明该站点存在的目的。 |

`status` 含义：

- `active` — 已上线，正常构建与部署。
- `staging` — 配置完成、内容尚在筹备，未公开宣传。
- `test` — Cloudflare Pages 等测试部署专用；非生产官网，勿对外宣传或绑定正式域名。
- `planned` — 已登记但还未运行 `pnpm site pipeline`（完整 Site Pipeline）。
- `archived` — 历史站点，已停服；保留登记记录便于追溯。

---

## 当前站点

| siteSlug | 中文名称 | English display name | 法人主体 | 行业 | 主题 | 域名 | Cloudflare Project | 状态 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `acme-manufacturing` | 艾克米制造（示例站） | Acme Manufacturing | Acme Manufacturing Ltd. | Industrial manufacturing | `enterprise` | https://www.acme-manufacturing.com | `acme-manufacturing` | `active` | 示例站，演示工业制造类企业官网的构建与部署流程。 |
| `beta-saas` | Beta SaaS（示例站） | Beta SaaS | Beta SaaS Inc. | saas | `enterprise` | https://www.beta-saas.com | `beta-saas` | `active` | 示例站，演示 SaaS / 软件服务类企业官网的构建与部署流程。 |
| `demo-technical-product-showcase` | 科技产品展示主题测试站 | Technical Product Showcase Demo | Technical Product Showcase Demo Co. | B2B technical product showcase (demo) | `technical-product-showcase` | https://demo-technical-product-showcase.example.com | `demo-technical-product-showcase` | `staging` | 主题测试站，专门用于演示 `technical-product-showcase` 主题的渲染效果（智能装备 / 工业技术 / 能源系统 / 模块化产品）；不是真实公司官网，**不要**对外宣传或绑定真实域名。 |
| `efh-house` | 易折叠房屋官网（测试站） | EFH House Test Site | EFH House Test Site (Not a production website) | prefab housing / modular housing / container house | `technical-product-showcase` | https://efh-house-test.pages.dev | `efh-house-test` | `test` | Cloudflare Pages test deployment. Not a production website. 预制房屋 B2B 内容用于构建与主题验证；**不展示价格**。 |
| `energy-storage-enclosure` | 国兰智能装备（演示占位） | Glorich Energy | Glorich Energy Equipment Co., Ltd. (placeholder) | Energy storage enclosures / battery cabinets / industrial energy equipment (demo) | `energy-storage-showcase` | https://energy-storage-enclosure.example.com | `energy-storage-enclosure` | `staging` | 演示站点：双语内容、`energy-storage-showcase` 主题与 FAB/Footer 多列配置占位；上线前须替换占位法人、联系方式与文案。 |
| `energy-storage-test-company` | **内部 fixture** · 伏特储能占位（ESS 第二站复用验证专用） | Voltpack Enclosure | Voltpack Enclosure Demonstration Entity (PLACEHOLDER) | Industrial B2B: containerized ESS / liquid-cooled cabinets / outdoor battery housings / custom sheet-metal (demo) | `energy-storage-showcase` | `(none)` **禁止绑定真实域名** | `(none)` **禁止创建或使用 Cloudflare Pages Project（不部署 Pages）** | `test` | **Internal reuse validation fixture for energy-storage-showcase**。**不用于生产**；**不绑定真实生产域名**；**不部署 Cloudflare Pages**；**仅用于验证** `energy-storage-showcase` **是否可被第二站复用**（与 `energy-storage-enclosure` 配对：`pnpm site validate` / `pnpm site build` / `pnpm site build-all`）。 |

> 表中部分行是项目内置的示例站点，用来验证构建管线。**`energy-storage-test-company` 登记定位为内部复用测试站点（fixture）**：用途见上表「用途」列英文首句 **`internal reuse validation fixture for energy-storage-showcase`**；**非客户项目**，**不作为生产官网**，**不绑定真实域名**，**不向 Cloudflare Pages 部署**。站点目录仅存于源码树供主题与管线回归。
>
> 真实公司站点请追加新行，**不要**复用仅为演示或内部回归保留的 slug（如 `acme-manufacturing` / `beta-saas` / `energy-storage-test-company`）。

---

## 新增站点须知

1. 严格按 `.cursor/rules/30-new-site-workflow.mdc` 走流程：先 `pnpm site pipeline <siteSlug>`（生成 → 校验 → 构建），再编辑 `site.config.ts` 和页面 JSON。
2. **在创建期间或之前**就要在本文件追加一行登记，不要等上线之后再补。
3. 新行的 `主题` 列必须是 `docs/registries/theme-registry.md` 中已登记并处于 `active` / `draft` 状态的 theme ID。
4. 新行的 Cloudflare Project 列必须与 `site.config.ts` 中的 `deploy.projectName` 一致。
5. 暂时没有自定义域名时，"域名"列填 `(pending)` 并把 `状态` 设为 `staging` 或 `planned`。

## 删除 / 归档站点须知

1. 走 `.cursor/rules/60-deletion-workflow.mdc` 的"Site deletion"清单。
2. 在本文件中**不要直接删行**——把 `状态` 改为 `archived`，方便追溯。如果是误登记的 `planned` 行从未实际创建过，可以直接移除。
3. 归档行的"用途"列追加归档原因与日期，例如：`archived 2026-04 — 客户终止合作`。
