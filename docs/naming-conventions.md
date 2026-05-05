# 命名约定 / Naming Conventions

This document is the human-readable companion to `.cursor/rules/50-registry-and-naming.mdc`. The rule is authoritative; this document explains the reasoning and provides examples.

## 核心原则 / Core principle

**技术标识符（technical identifiers）必须使用小写 ASCII kebab-case，永不允许中文。**
**所有需要中文展示的名称（中文公司名、主题中文名、用途说明等）只记录在 `docs/registries/` 与页面内容里。**

把"机器读的名字"和"人读的名字"分开是为了：

- 避免文件系统、URL、shell、Cloudflare、CI、Git 等工具链遇到非 ASCII 时的兼容性问题。
- 让 `siteSlug` 直接作为 Cloudflare Pages Project 名称、域名前缀、CSS class 后缀等无歧义复用。
- 中文展示名可以随时调整（市场口径变化），不影响技术身份。

---

## 必须使用 ASCII kebab-case 的字段

| 场景 | 字段 | 示例 |
| --- | --- | --- |
| 站点目录与 slug | `sites/<siteSlug>/`、`site.config.ts` 中的 `slug` | `acme-manufacturing` |
| 主题包目录与 ID | `packages/theme-<theme-id>`、`site.config.ts` 中的 `theme` | `enterprise`、`immersive-showcase` |
| Workspace 包名 | `package.json` 的 `name` | `@factory/theme-enterprise` |
| Cloudflare Pages Project | `site.config.ts` 中的 `deploy.projectName` | `acme-manufacturing` |
| 环境变量名 | `NODE_VERSION`、`LEAD_WEBHOOK_URL` 等 | 全部 ASCII，下划线分隔 |
| Import path | `@factory/theme-enterprise`、`@factory/ui` 等 | ASCII |
| JSON 文件名与字段名 | `home.json`、`primaryCta` 等 | ASCII |
| CSS class 与变量名 | `.theme-enterprise`、`.ims-hero`、`--ims-color-bg` | ASCII |

`siteSlug` 正则约束：`^[a-z0-9]+(?:-[a-z0-9]+)*$`。Theme ID 同正则。

## 允许出现中文的位置

| 位置 | 用途 |
| --- | --- |
| `docs/**/*.md` | 文档语言以中文为主，技术标识符仍写 ASCII。 |
| `sites/<siteSlug>/content/<locale>/pages/*.json` 中的页面文案、`seo.title`、`seo.description`、各 section 的 `title`/`description`/`label` 等 | 站点真实展示文字。 |
| `site.config.ts` 中的 `company.legalName`、`company.displayName`、`navigation[].label`、`seo.*`、`legal.dataController` 等真实展示用字段 | 公司中文名与导航文字。 |
| `docs/registries/site-registry.md` 与 `docs/registries/theme-registry.md` 中的"中文名称"列 | 唯一的中文 ↔ 技术 ID 映射来源。 |

---

## 站点登记示例

```text
siteSlug:           acme-manufacturing
中文名称:           艾克米制造（示例站）
英文展示名:         Acme Manufacturing
法人主体:           Acme Manufacturing Ltd.
行业:               Industrial manufacturing
主题:               enterprise
域名:               https://www.acme-manufacturing.com
Cloudflare Project: acme-manufacturing
状态:               active
用途:               示例站，用于演示企业制造类官网构建流程
```

中文名称只出现在 `docs/registries/site-registry.md`，不要写进任何源代码、目录名、Cloudflare 配置或导出名。

## 主题登记示例

```text
主题 ID:           immersive-showcase
中文名称:           沉浸式产品展示主题
包目录:            packages/theme-immersive-showcase
CSS 根类:          .theme-immersive-showcase
CSS 前缀:          .ims-*
适用场景:           模块化房屋 / 储能 / 工业品 / 智能硬件 / 外贸制造
视觉关键词:         深色 / 全屏 Hero / 蓝灰遮罩 / 超大白字
状态:               draft
主题文档:          docs/themes/immersive-showcase.md
```

中文名称同样只在 registry 中出现。包目录、CSS 根类、CSS 前缀全部 ASCII。

---

## 命中违规时怎么办

如果发现一个技术标识符里含有中文：

1. 把它改成对应的 ASCII kebab-case slug。
2. 在 `docs/registries/site-registry.md` 或 `docs/registries/theme-registry.md` 添加 / 更新中文名称列。
3. 把所有引用（package.json、import、site.config.ts 等）一并改完。
4. 跑 `pnpm site validate <slug>` 和 `pnpm site build <slug>` 确认未破坏。
5. 在 commit message 里说明这是命名规范修复。

参见 `.cursor/rules/50-registry-and-naming.mdc`、`.cursor/rules/30-new-site-workflow.mdc`、`.cursor/rules/20-theme-naming-and-governance.mdc`。
