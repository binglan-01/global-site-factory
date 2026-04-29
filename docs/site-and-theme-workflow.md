# 站点 / 主题完整工作流 / Site & Theme Workflows

> 本文档把 `.cursor/rules/30-new-site-workflow.mdc`、`.cursor/rules/60-deletion-workflow.mdc`、`.cursor/rules/70-framework-change-workflow.mdc`、`.cursor/rules/20-theme-naming-and-governance.mdc` 四条规则整理成可读 cookbook，便于人工执行。
> 规则文件是权威来源；本文档与规则不一致时，以规则为准。

---

## 一、新增公司站点 / Add a new site

### 第 1 步 · 选 slug 与登记

1. 选定一个 ASCII kebab-case `siteSlug`（详见 `docs/naming-conventions.md`）。
2. 在 `docs/registries/site-registry.md` 追加一行登记，状态先填 `planned` 或 `staging`。
3. 确认要使用的 `theme` 已在 `docs/registries/theme-registry.md` 中处于 `active` 或 `draft` 状态。

### 第 2 步 · 用脚手架创建站点

```powershell
pnpm create-site <siteSlug>
```

只允许通过 `pnpm create-site` 创建。**不要**复制粘贴别的 `sites/<other-slug>/` 目录。

### 第 3 步 · 配置与内容

按需修改：

- `sites/<siteSlug>/site.config.ts` — 公司信息、域名、导航、主题、SEO、法务、部署。
- `sites/<siteSlug>/content/<locale>/pages/*.json` — 各页面的 sections（`hero`、`services-grid` 等）。
- `sites/<siteSlug>/assets/` — 站点专属图片、Logo。

资产路径强约束：

- 把图片放到 `sites/<siteSlug>/assets/` 之下。
- 在页面 JSON 中只能用 `"/assets/<filename>"` 引用，**不要**写 `sites/<siteSlug>/assets/...`、相对路径、本地绝对路径。
- 构建脚本会把站点资产复制到输出根的 `/assets/` 下，所以同一路径在生产环境也能解析。

### 第 4 步 · 校验与构建

每次有意义的修改之后都要跑：

```powershell
pnpm validate-site <siteSlug>   # Zod 校验 site.config.ts 与所有 page JSON
pnpm build-site <siteSlug>      # 构建产物输出到 dist/sites/<siteSlug>/
```

### 第 5 步 · Cloudflare Pages 配置

按 `.cursor/rules/80-cloudflare-and-leads.mdc`：

- Project name = `siteSlug`
- Root directory `/`
- Build command `pnpm build-site <siteSlug>`
- Output directory `dist/sites/<siteSlug>`
- 环境变量 `NODE_VERSION=20`
- 不要新建 GitHub Actions（除非用户明确要求）。

### 第 6 步 · 上线后回填登记

把 `docs/registries/site-registry.md` 中该行的 `状态` 改为 `active`，补全实际域名与 Cloudflare Project 名。

### 硬底线

新增 / 修改公司站点**严禁**触碰 `apps/`、`packages/`、`scripts/`、`functions/`，除非用户明确批准走**第八节**「框架级变更」流程。

---

## 二、多语言站点使用方式 / Multilingual sites

### 配置入口

- 站点的可用语言由 `sites/<siteSlug>/site.config.ts` 中的 **`locales`**（数组）与 **`defaultLocale`**（字符串）共同决定。
- **`defaultLocale` 必须是 `locales` 中的一项**（校验规则见 `packages/validators`）。

### URL 与路由约定

- **默认语言**：URL **不带**语言前缀，与其他路径规则一致。例如首页为 `/`，产品页为 `/products`。
- **非默认语言**：URL 使用 **`/<locale>/...`** 前缀。例如默认语言为 `en`、`zh` 为非默认时，中文产品页为 **`/zh/products`**（locale 取自 `site.config.ts`，不要求写死为 `zh`）。

### 内容目录

- 每一种在 `locales` 中声明的语言，都需要有独立的页面 JSON，路径为：`sites/<siteSlug>/content/<locale>/pages/*.json`。
- **同一逻辑页面**在不同语言下使用**相同的 `slug` 值**（例如均为 `"/products"`），**不要**把 `slug` 写成中文路径（如 `"/产品"`）。

### Header 语言切换（框架内置）

- **语言切换入口由主题 Header 统一提供**，属于通用能力；当且仅当 **`siteConfig.locales.length >= 2`** 时才会显示。
- 具体文案（如英文简称、各语言自称）由构建端根据 locale 生成；**站点配置或内容作者不应在 Header 组件里写死某种语言的固定 URL 片段**（例如硬编码 `"/zh/products"`）。新增语言时只需扩展 `locales` 并在 `content/<新 locale>/pages/` 中提供同结构页面即可。

### 校验与构建

修改 `locales` 或新增某一语言的页面后，仍需对该站点执行：

```powershell
pnpm validate-site <siteSlug>
pnpm build-site <siteSlug>
```

---

## 三、修改已存在的站点 / Update an existing site

1. 只在 `sites/<siteSlug>/` 之下改动。
2. 改完跑 `pnpm validate-site <siteSlug>`、`pnpm build-site <siteSlug>`。
3. 如果改动涉及域名、状态或主题切换，同步更新 `docs/registries/site-registry.md` 对应行。
4. 如果改动需要"框架里目前没有的能力"，**先暂停修站点**，进入**第八节**走通用框架变更，再回来用。

---

## 四、删除 / 归档公司站点 / Delete or archive a site

```text
1. 删除站点源代码：sites/<siteSlug>/
2. 删除构建产物（若存在）：dist/sites/<siteSlug>/
3. 在 docs/registries/site-registry.md 中把该行的 `状态` 改为 `archived`，
   不要直接删行（仅在该站从未实际创建的 `planned` 行才允许删行）。
4. 处理 docs/sites/<siteSlug>.md（若存在）：删除或在文档顶部标注 archived。
5. 提醒用户在 Cloudflare 控制台删除或断开对应 Pages Project。
6. 提醒用户解绑自定义域名并删除相关 DNS 记录。
7. 跑 pnpm build-all-sites 确认其余站点仍然构建成功。
```

执行人不要"顺手"在 Cloudflare / DNS 上代为操作，本仓库流程仅负责代码与构建产物，云资源回收必须由用户在控制台完成。

---

## 五、新增 UI 主题 / Add a new theme

### 第 1 步 · 选 ID 与登记

1. 选定一个 ASCII kebab-case `theme-id`，遵循 `.cursor/rules/20-theme-naming-and-governance.mdc`：
   - 推荐使用行业中性 / 视觉模式描述名：`immersive-showcase`、`industrial-grid`、`luxury-residence`、`catalog-trade`、`technical-b2b`、`minimal-corporate`。
   - 禁止：`theme1`、`new-theme`、`beautiful-theme`、版本号 / 自夸名。
   - 禁止中文。
2. 在 `docs/registries/theme-registry.md` 追加一行登记，状态先填 `draft`。

### 第 2 步 · 创建主题包

在 `packages/theme-<id>/` 下创建：

- `package.json`（`name: "@factory/theme-<id>"`、导出 `./` 和 `./styles.css`）。
- `tsconfig.json`。
- `src/index.ts`：导出与 `@factory/theme-enterprise` **完全一致**的组件名（`Header`、`Footer`、`Hero`、`ServicesGrid`、`Gallery`、`ContactForm`、`FeatureList`、`ImageText`、`CaseStudies`、`ProcessSteps`、`Stats`、`FAQ`、`Certificates`、`ContactBlock`），以及对应的 `*Section` / `*Props` 类型。
- `src/components/<Section>.tsx`：每种 section 的实现，**不能用 any**，所有公司数据来自 props。
- `src/styles/theme-<id>.css`：所有 CSS 规则 scope 在 `.theme-<id>` 之下；class 前缀使用全名或短别名（短别名要在文件顶部注释里写明全称映射）。

不能做：

- 不能 import 任何别的 `packages/theme-*`（主题之间是平级关系）。
- 不能在主题里写死任何公司名、Logo、导航文字、邮箱、电话、文案。
- 不能为单一站点写专属 CSS。
- 不支持的 section 类型也必须给安全降级 fallback，不能让 build 失败。

### 第 3 步 · 写主题文档

`docs/themes/<id>.md`，建议包含：

- 主题定位
- 适用行业
- 视觉关键词
- Header / Hero / 各 section 在该主题下的展示规范
- 字体 / 颜色 / 间距 / 圆角 / 容器宽度 token
- 推荐的首页 / 服务页 / 关于页 / 联系页 sections 顺序
- 站点如何选用该主题、如何填充内容
- 与已有主题的差异化定位

### 第 4 步 · 接入 site-builder

按 `.cursor/rules/70-framework-change-workflow.mdc` 走通用框架变更：

1. `packages/validators/src/site-config.schema.ts` 的 `theme` 枚举添加新 ID。
2. `apps/site-builder` 的主题 registry 注册 `<id> => @factory/theme-<id>`，并加上 `.theme-<id>` 根类映射。
3. `apps/site-builder/src/layouts/SiteLayout.astro` 引入新主题 CSS（`@factory/theme-<id>/styles.css`），按 `siteConfig.theme` 选 Header/Footer 与根 class。
4. `apps/site-builder/src/components/SectionRenderer.tsx` 透过 registry 取主题模块，所有 `case` 都用 `<theme.X />` 形式。

### 第 5 步 · 验证

```powershell
pnpm install                       # workspace 数应该 +1
pnpm -F @factory/theme-<id> typecheck
pnpm -F @factory/site-builder typecheck
pnpm validate-site <一个用 enterprise 的站>   # 旧站不能受影响
pnpm build-site   <一个用 enterprise 的站>
```

至少有一个 `active` 站点把 `theme:` 切到新 ID 并成功构建后，再把 `docs/registries/theme-registry.md` 中状态从 `draft` 改为 `active`。

---

## 六、修改已存在的主题 / Update an existing theme

- 视觉调整 / 加新 section / 改 token：直接在 `packages/theme-<id>/` 内做。所有 site 都会受影响，所以必须跑 `pnpm build-all-sites` 验证。
- 加新 section 类型属于框架变更，见**第八节**。
- 不允许"为某个站点的特殊情况"在主题里写死分支，例如不允许 `if (siteConfig.slug === "...")`。差异需求请通过 `site.config.ts` 数据（如 `themeTokens`、`brand.logo`）解决。

---

## 七、删除 / 归档主题 / Delete or archive a theme

```text
1. 在所有 sites/*/site.config.ts 中搜索该 theme ID；如果还有站点在用，先把它们迁到别的活跃主题。
2. 把这些站点的 `主题` 列在 site-registry.md 中更新，并各自构建验证。
3. 删除 packages/theme-<id>/。
4. 从 packages/validators/src/site-config.schema.ts 的 theme 枚举里移除。
5. 从 apps/site-builder 的主题 registry 里移除模块条目与根类映射。
6. 从 apps/site-builder/src/layouts/SiteLayout.astro（或等价的 loader）里移除该主题的 CSS import 与 class 处理。
7. 处理 docs/themes/<id>.md：删除或在顶部标注 archived。
8. 在 docs/registries/theme-registry.md 中把该行 `状态` 改为 `archived`，不要直接删行。
9. 跑 pnpm build-all-sites 确认所有站点仍然成功构建。
```

---

## 八、框架级变更（新增 section 类型）/ Generic framework change

当某个站点需要的 section 类型 / 能力当前框架表达不了，**不要**为它一个站点写死。改框架的代价远小于在多主题多站点之间维护一个特殊分支。

一次完整的"加新 section 类型"必须同时改：

1. `packages/validators/src/page.schema.ts` — 加 `XxxSectionSchema`，并加进 `SectionSchema` 的 discriminated union，导出 `XxxSection` 类型。
2. 每个 `packages/theme-*/src/components/<Section>.tsx` — 真实实现或安全 fallback，不允许某个主题"假装这种 section 不存在"。
3. 每个 `packages/theme-*/src/index.ts` — 导出新组件与类型。
4. `apps/site-builder/src/components/SectionRenderer.tsx` — 加新 `case`，分发给当前主题。
5. `docs/themes/<id>.md` — 在每个主题文档中描述这种 section 的展示策略。
6. 必要时在示例页面中加演示，但不要为了演示去改真实客户的 page JSON。

完成后跑 `pnpm build-all-sites`。

> 还有一些跨主题硬规则在 `.cursor/rules/40-no-go-rules.mdc` 与 `.cursor/rules/80-cloudflare-and-leads.mdc` 中明确，例如"不引入数据库"、"不接 CMS"、"不在主题包硬编码客户信息"、"`functions/api/lead.ts` 不允许记录 PII"等。这些是**长期红线**，不在本工作流文档里重复。
