/**
 * Scaffold 入口已在 `tools/create-site/create-site.ts`，且仅能通过 `pnpm site create` 调用。
 * 本文件用于拦截误用的历史路径 `/scripts/create-site.ts`。
 */

console.error(
  "脚手架入口不在 `scripts/create-site.ts`。请使用：`pnpm site create <siteSlug>`。\n",
);
process.exit(1);
