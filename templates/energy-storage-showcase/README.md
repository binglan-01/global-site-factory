# ESS 手工模板：`energy-storage-showcase`

本目录为 **储能（ESS）双语展示站** 的脚手架草案，结构对齐已通过 `pnpm site validate` / `pnpm site build` 的 `energy-storage-enclosure`（主参考）与 `energy-storage-test-company`（同主题二次复测）。

## FACTORY v1 冻结说明（重要）

- **`pnpm site create`** 与站点管线 **仍仅使用** `templates/demo-technical-product-showcase/`；实现见 `tools/create-site/create-site.ts`（本仓库刻意 **未** 将本 ESS 模板接入 CLI）。
- 本 ESS 模板供 **手工复制** 或未来 v2「多模板选择」演进时接入，避免在 v1 freeze 窗口内改动默认 create / pipeline 行为。

## 使用方式（手工）

1. 复制整个 `templates/energy-storage-showcase/` 到 `sites/<new-slug>/`（勿直接覆盖已有站点）。
2. 将 `site.config.template.ts` **重命名**为 `site.config.ts`（与已上线站点保持一致）。
3. 在 **`site.config.ts` 与 `content/**/*.json`** 内全局替换下列占位 token（替换后 **`{{`** 不得残留）。
4. 按需替换壳体占位图（`/assets/` 下当前为极小 JPEG，仅保证路径可解析）。
5. 登记 `docs/registries/site-registry.md` 后执行 `pnpm site validate <slug>`、`pnpm site build <slug>`。

### Token 表

| Token | 用途示例 |
| --- | --- |
| `{{SITE_SLUG}}` | `slug`、联系表单 `formId` 等 |
| `{{DOMAIN}}` | `site.config.ts` 的 `domain`（完整 URL，`https://` 前缀） |
| `{{DEPLOY_PROJECT_NAME}}` | `deploy.projectName`，通常等同 Cloudflare Pages 项目名 |
| `{{DISPLAY_NAME_EN}}` | 英文对外名称、`seo`、`legal` 占位等 |
| `{{DISPLAY_NAME_ZH}}` | 中文对外名称（页面文案 / SEO） |
| `{{PRIMARY_HOST}}` | 邮件域：`hello@`、`privacy@` 等（不含协议） |

`company.legalName`、`registeredCountry`、`registeredAddress`、`industry` 长文案等仍可手工改为真实信息；默认值刻意标为 **REPLACE_ME / placeholder**，便于检索。
