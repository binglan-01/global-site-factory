import { loadSite } from "@factory/site-core";
import { requireSiteCliInvocation } from "./site-script-guard.js";

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  requireSiteCliInvocation("validate-site");

  const siteSlug = process.argv[2];

  if (!siteSlug) {
    throw new Error('Missing site slug. Usage: pnpm site validate <siteSlug>');
  }

  await loadSite(siteSlug);
  console.log(`Site "${siteSlug}" is valid.`);
}

main().catch((error: unknown) => {
  console.error(`Failed to validate site: ${formatUnknownError(error)}`);
  process.exit(1);
});
