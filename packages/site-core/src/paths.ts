import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function getRepoRoot(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return resolve(currentDir, "../../..");
}

export function getSitesDir(): string {
  return join(getRepoRoot(), "sites");
}

export function getSiteDir(siteSlug: string): string {
  return join(getSitesDir(), siteSlug);
}

export function getSiteConfigPath(siteSlug: string): string {
  return join(getSiteDir(siteSlug), "site.config.ts");
}

export function getSiteContentDir(siteSlug: string, locale: string): string {
  return join(getSiteDir(siteSlug), "content", locale);
}

export function getSitePagesDir(siteSlug: string, locale: string): string {
  return join(getSiteContentDir(siteSlug, locale), "pages");
}

export function getSiteAssetsDir(siteSlug: string): string {
  return join(getSiteDir(siteSlug), "assets");
}
