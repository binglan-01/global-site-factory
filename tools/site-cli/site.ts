/**
 * Unified Site Factory CLI — single public entry for scaffolding, validation, and builds.
 *
 * Routing only: delegates to internal `tsx` scripts (sets `SITE_FACTORY_FROM_SITE_CLI=1`).
 */
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const SLUG_HELP = `<siteSlug>`;

const ROUTES_WITH_SLUG = {
  create: join(REPO_ROOT, "tools", "create-site", "create-site.ts"),
  validate: join(REPO_ROOT, "scripts", "validate-site.ts"),
  build: join(REPO_ROOT, "scripts", "build-site.ts"),
  pipeline: join(REPO_ROOT, "scripts", "site-pipeline.ts"),
} as const;

const ROUTES_GLOBAL = {
  "build-all": join(REPO_ROOT, "scripts", "build-all-sites.ts"),
  clean: join(REPO_ROOT, "scripts", "clean.ts"),
} as const;

type SiteCommandWithSlug = keyof typeof ROUTES_WITH_SLUG;
type SiteCommandGlobal = keyof typeof ROUTES_GLOBAL;

function mergeChildEnv(): NodeJS.ProcessEnv {
  return { ...process.env, SITE_FACTORY_FROM_SITE_CLI: "1" };
}

function printUsage(): void {
  process.stderr.write(
    [
      "pnpm site — Site Factory 对外唯一官方入口",
      "",
      "Usage:",
      `  pnpm site create ${SLUG_HELP}     脚手架：模板复制与占位符替换`,
      `  pnpm site validate ${SLUG_HELP}    Zod + loadSite 校验`,
      `  pnpm site build ${SLUG_HELP}       生成 .generated 并执行 Astro 构建`,
      `  pnpm site pipeline ${SLUG_HELP}    create → validate → build（stdout 末行 JSON）`,
      "  pnpm site build-all                依次构建 sites/ 下全部站点",
      "  pnpm site clean                     清理 .generated / dist 等中间产物",
      "",
    ].join("\n"),
  );
}

async function dispatch(): Promise<void> {
  const command = process.argv[2]?.toLowerCase();

  const globals = ["build-all", "clean"] as const satisfies readonly SiteCommandGlobal[];
  if (command && globals.includes(command as SiteCommandGlobal)) {
    const gc = command as SiteCommandGlobal;
    if (process.argv.length > 3) {
      process.stderr.write(`错误：pnpm site ${gc} 不需要 siteSlug（请勿附加参数）。\n`);
      printUsage();
      process.exit(1);
      return;
    }
    const scriptPath = ROUTES_GLOBAL[gc];
    const result = await execa("pnpm", ["exec", "tsx", scriptPath], {
      cwd: REPO_ROOT,
      stdio: "inherit",
      reject: false,
      preferLocal: true,
      env: mergeChildEnv(),
    });
    process.exit(result.exitCode ?? 1);
    return;
  }

  const siteSlug = process.argv[3];

  const withSlug = ["create", "validate", "build", "pipeline"] as const satisfies readonly SiteCommandWithSlug[];
  if (
    command === undefined ||
    !(withSlug as readonly string[]).includes(command) ||
    !siteSlug ||
    siteSlug.length === 0
  ) {
    printUsage();
    process.stderr.write("(缺少命令或 siteSlug)\n");
    process.exit(1);
    return;
  }

  const slugCommand = command as SiteCommandWithSlug;
  const scriptPath = ROUTES_WITH_SLUG[slugCommand];
  const result = await execa("pnpm", ["exec", "tsx", scriptPath, siteSlug], {
    cwd: REPO_ROOT,
    stdio: "inherit",
    reject: false,
    preferLocal: true,
    env: mergeChildEnv(),
  });

  process.exit(result.exitCode ?? 1);
}

dispatch().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
