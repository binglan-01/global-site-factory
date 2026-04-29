import type { SiteConfig } from "@factory/validators";
import { loadPages } from "./load-pages";
import { loadSiteConfig } from "./load-site-config";
import { resolvePagesGalleryAssetDirs } from "./resolve-pages-gallery-assets";

export type LoadedSite = {
  config: SiteConfig;
  pagesByLocale: Record<string, PageContent[]>;
};

export async function loadSite(siteSlug: string): Promise<LoadedSite> {
  const config = await loadSiteConfig(siteSlug);
  const pagesByLocaleEntries = await Promise.all(
    config.locales.map(async (locale) => {
      const pages = await loadPages(siteSlug, locale);
      const resolved = await resolvePagesGalleryAssetDirs(siteSlug, pages);
      return [locale, resolved] as const;
    }),
  );

  return {
    config,
    pagesByLocale: Object.fromEntries(pagesByLocaleEntries),
  };
}
