# EFH House — Cloudflare Pages 测试部署说明

1. **用途**：本站点当前配置为 **Cloudflare Pages 测试部署**，用于验证构建与发布流程，**不是**正式生产商业官网。

2. **Cloudflare Project name**：`efh-house-test`

3. **测试域名**：https://efh-house-test.pages.dev

4. **域名策略**：测试阶段 **不绑定** 正式自定义域名。

5. **集成策略**：**不配置** 真实 CRM、webhook 或生产级线索回调。

6. **联系方式**：页面与 `site.config.ts` 中为占位/测试信息；**不使用**真实市场部对外联系方式（正式联系方式仅在 `site.config.ts` 的 `// PRODUCTION …` 注释中保留，便于恢复）。

7. **测试结束后**：可在 Cloudflare 控制台中 **删除或停用** 对应的 Pages Project（按团队流程执行）。

8. **正式上线前**：需恢复正式 `company`、`domain`、`deploy.projectName`、`seo`、`legal` 及页面文案，并删除或替换所有「测试站」提示与占位联系方式。
