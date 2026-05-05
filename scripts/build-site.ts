import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import { copySiteAssets, loadSite } from "@factory/site-core";
import { requireSiteCliInvocation } from "./site-script-guard.js";

function getRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  requireSiteCliInvocation("build-site");

  const siteSlug = process.argv[2];

  if (!siteSlug) {
    throw new Error('Missing site slug. Usage: pnpm site build <siteSlug>');
  }

  const repoRoot = getRepoRoot();
  const siteBuilderDir = join(repoRoot, "apps", "site-builder");
  const generatedDir = join(siteBuilderDir, ".generated");
  const publicAssetsDir = join(siteBuilderDir, "public", "assets");
  const siteBuilderDistDir = join(siteBuilderDir, "dist");
  const outputDir = join(repoRoot, "dist", "sites", siteSlug);

  const site = await loadSite(siteSlug);

  await rm(generatedDir, { recursive: true, force: true });
  await mkdir(generatedDir, { recursive: true });
  await writeFile(join(generatedDir, ".gitkeep"), "", "utf8");
  await writeJsonFile(join(generatedDir, "site.json"), site.config);
  await writeJsonFile(join(generatedDir, "pages.json"), site.pagesByLocale);

  await rm(publicAssetsDir, { recursive: true, force: true });
  await copySiteAssets(siteSlug, publicAssetsDir);

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(dirname(outputDir), { recursive: true });
  await rm(siteBuilderDistDir, { recursive: true, force: true });

  await execa("pnpm", ["--filter", "@factory/site-builder", "build"], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  await rename(siteBuilderDistDir, outputDir);

  console.log(`Site "${siteSlug}" built successfully at ${outputDir}.`);
}

main().catch((error: unknown) => {
  console.error(`Failed to build site: ${formatUnknownError(error)}`);
  process.exit(1);
});
