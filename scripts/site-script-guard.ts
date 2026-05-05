/**
 * Site Factory internal scripts (`scripts/*.ts`, `tools/create-site/*`) must run only
 * when spawned by `tools/site-cli/site.ts`, which sets `SITE_FACTORY_FROM_SITE_CLI=1`.
 */
export function requireSiteCliInvocation(toolName: string): void {
  if (process.env["SITE_FACTORY_FROM_SITE_CLI"] === "1") {
    return;
  }
  if (process.env["SITE_FACTORY_ALLOW_DIRECT_SCRIPTS"] === "1") {
    return;
  }
  console.error(
    `[${toolName}] 不支持直接运行本脚本（例如 pnpm exec tsx …）。请使用官方入口：` +
      "`pnpm site <command> …`（维护排障如需绕过可设 SITE_FACTORY_ALLOW_DIRECT_SCRIPTS=1）。",
  );
  process.exit(1);
}
