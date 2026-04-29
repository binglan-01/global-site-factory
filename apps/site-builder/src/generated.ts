import { PageSchema, SiteConfigSchema, type PageContent, type SiteConfig } from "@factory/validators";
import rawPagesByLocale from "../.generated/pages.json";
import rawSiteConfig from "../.generated/site.json";

const parsedSiteConfig = SiteConfigSchema.parse(rawSiteConfig);
const parsedPagesByLocale = Object.fromEntries(
  Object.entries(rawPagesByLocale as Record<string, unknown>).map(([locale, pages]) => [
    locale,
    PageSchema.array().parse(pages),
  ]),
);

export const siteConfig: SiteConfig = parsedSiteConfig;
export const pagesByLocale: Record<string, PageContent[]> = parsedPagesByLocale;
