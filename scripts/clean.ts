import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

function getRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  const repoRoot = getRepoRoot();
  const siteBuilderDir = join(repoRoot, "apps", "site-builder");
  const generatedDir = join(siteBuilderDir, ".generated");
  const publicAssetsDir = join(siteBuilderDir, "public", "assets");
  const siteBuilderDistDir = join(siteBuilderDir, "dist");
  const repoDistDir = join(repoRoot, "dist");

  const targets = [generatedDir, publicAssetsDir, siteBuilderDistDir, repoDistDir];

  for (const target of targets) {
    await rm(target, { recursive: true, force: true });
    console.log(`Removed ${target}`);
  }

  await mkdir(generatedDir, { recursive: true });
  await writeFile(join(generatedDir, ".gitkeep"), "", "utf8");
  console.log(`Recreated ${generatedDir}/.gitkeep`);
}

main().catch((error: unknown) => {
  console.error(`Failed to clean: ${formatUnknownError(error)}`);
  process.exit(1);
});
