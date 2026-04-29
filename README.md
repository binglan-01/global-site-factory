# global-site-factory

`global-site-factory` 是一个多实体公司官网生成平台。每个公司官网作为独立站点管理在同一个 monorepo 中，通过 `sites/<siteSlug>/` 存放配置、内容和资产，再由 `apps/site-builder` 构建为静态网站。

## 目录结构

- `apps/site-builder`: Astro 静态官网生成器，只读取 `apps/site-builder/.generated/` 下的 JSON。
- `packages/validators`: Zod schema 和数据校验。
- `packages/site-core`: 读取 `sites/<siteSlug>/` 下的站点配置、页面内容和资产。
- `packages/theme-enterprise`: 企业官网主题组件。
- `packages/ui`: 基础 UI 组件。
- `packages/seo`: SEO、canonical、sitemap、robots、schema 纯函数。
- `sites/<siteSlug>`: 每个公司官网的配置、内容和资产。
- `scripts`: 创建、校验、构建单站和构建全部站点的自动化脚本。
- `functions/api/lead.ts`: Cloudflare Pages Function 表单接口。

## 本地开发命令

```powershell
pnpm install
pnpm validate-site acme-manufacturing
pnpm build-site acme-manufacturing
pnpm build-all-sites
pnpm create-site gamma-energy
pnpm clean
pnpm typecheck
```

### 命令说明

- `pnpm validate-site <siteSlug>`：仅做 Zod 校验，不构建。
- `pnpm build-site <siteSlug>`：构建单个站点，产出在 `dist/sites/<siteSlug>/`。
  - 构建前会重新生成 `apps/site-builder/.generated/{site,pages}.json`。
  - 构建前会清空并复制 `sites/<siteSlug>/assets/` 到 `apps/site-builder/public/assets/`。
- `pnpm build-all-sites`：依次构建 `sites/` 下所有站点。
- `pnpm build`：等价于 `pnpm build-all-sites`（不要使用 `turbo run build`，turbo 不会重新生成 `.generated/`，会用陈旧数据构建）。
- `pnpm clean`：删除 `apps/site-builder/.generated/`、`apps/site-builder/public/assets/`、`apps/site-builder/dist/`、`dist/`，并重建空的 `.generated/.gitkeep`。
- `pnpm typecheck`：先跑根 `tsc -p .`（覆盖 `scripts/`、`packages/`、`functions/`），再跑 `turbo run typecheck`（各 package 自身的 `tsc --noEmit` 与 `astro check`）。
- `pnpm create-site <siteSlug>`：以 kebab-case 站点名生成默认骨架，包含 `site.config.ts` 与基础页面 JSON。

### 表单提交反馈

`functions/api/lead.ts` 在收到 `<form>` 提交后会：

- 浏览器原生表单提交：303 跳回 `pageUrl`，带上 `?lead=ok` / `?lead=invalid` / `?lead=error`。
- `Accept: application/json` 客户端：直接返回 JSON。

`apps/site-builder/src/layouts/SiteLayout.astro` 内置了一段 `is:inline` 客户端脚本，会读取 `?lead=` 参数渲染顶部提示条，并在渲染后用 `history.replaceState` 把参数从 URL 中移除。

## GitHub 仓库

- 使用 GitHub 私有仓库。
- 不使用 GitHub Actions。
- 由 Cloudflare Pages Git Integration 自动拉取仓库并构建。

## Cloudflare Pages Project 配置示例

每个公司官网对应一个 Cloudflare Pages Project。所有 Project 连接同一个 GitHub 仓库，但使用不同的 build command 和 output directory。

Cloudflare Pages Git Integration 通用配置：

- Root directory: `/`
- Build command: `pnpm build-site <siteSlug>`
- Output directory: `dist/sites/<siteSlug>`
- Environment variable: `NODE_VERSION=20`

构建流程说明：

- `pnpm build-site <siteSlug>` 会在构建前生成 `apps/site-builder/.generated/site.json` 和 `apps/site-builder/.generated/pages.json`。
- `.generated` 下的真实 JSON 不需要提交到 Git，只保留 `.gitkeep`。
- `apps/site-builder` 只读取 `.generated`，不会直接读取 `sites/`。
- `apps/site-builder/public/assets` 会在每次构建前清空，并复制当前站点的 `sites/<siteSlug>/assets`，避免不同站点资产混淆。
- 构建完成后，输出目录是 `dist/sites/<siteSlug>`，可直接作为 Cloudflare Pages 的 build output directory。

### Acme Manufacturing

Project name:

```text
acme-manufacturing
```

Root directory:

```text
/
```

Build command:

```text
pnpm build-site acme-manufacturing
```

Build output directory:

```text
dist/sites/acme-manufacturing
```

Environment variables:

```text
NODE_VERSION=20
```

### Beta SaaS

Project name:

```text
beta-saas
```

Root directory:

```text
/
```

Build command:

```text
pnpm build-site beta-saas
```

Build output directory:

```text
dist/sites/beta-saas
```

Environment variables:

```text
NODE_VERSION=20
```

## Build Watch Paths 建议

### acme-manufacturing include

```text
sites/acme-manufacturing/**
apps/site-builder/**
packages/**
scripts/**
functions/**
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

### acme-manufacturing exclude

```text
sites/beta-saas/**
```

### beta-saas include

```text
sites/beta-saas/**
apps/site-builder/**
packages/**
scripts/**
functions/**
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

### beta-saas exclude

```text
sites/acme-manufacturing/**
```

## 新增公司官网流程

```powershell
pnpm create-site <siteSlug>
```

然后按顺序处理：

1. 编辑 `sites/<siteSlug>/site.config.ts`。
2. 编辑 `sites/<siteSlug>/content/en/pages/*.json`。
3. 运行 `pnpm validate-site <siteSlug>`。
4. 运行 `pnpm build-site <siteSlug>`。
5. 在 Cloudflare Pages 新建 Project。
6. 配置对应的 build command 和 build output directory。

## 第一版暂不接入

- Headless CMS
- CRM
- 数据库
- GitHub Actions
