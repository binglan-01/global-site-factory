import { loadSite } from "@factory/site-core";

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  const siteSlug = process.argv[2];

  if (!siteSlug) {
    throw new Error('Missing site slug. Usage: pnpm validate-site <siteSlug>');
  }

  await loadSite(siteSlug);
  console.log(`Site "${siteSlug}" is valid.`);
}

main().catch((error: unknown) => {
  console.error(`Failed to validate site: ${formatUnknownError(error)}`);
  process.exit(1);
});
