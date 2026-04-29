import { readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

function getRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  const repoRoot = getRepoRoot();
  const sitesDir = join(repoRoot, "sites");
  const entries = await readdir(sitesDir, { withFileTypes: true });
  const siteSlugs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  if (siteSlugs.length === 0) {
    throw new Error(`No site directories found in ${sitesDir}.`);
  }

  for (const siteSlug of siteSlugs) {
    console.log(`Building site "${siteSlug}"...`);
    await execa("pnpm", ["build-site", siteSlug], {
      cwd: repoRoot,
      stdio: "inherit",
    });
    console.log(`Site "${siteSlug}" built successfully.`);
  }
}

main().catch((error: unknown) => {
  console.error(`Failed to build all sites: ${formatUnknownError(error)}`);
  process.exit(1);
});
