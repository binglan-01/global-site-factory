import type { SiteConfig } from "@factory/validators";

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

export function buildLocalizedPath(
  siteConfig: SiteConfig,
  locale: string,
  slug: string,
): string {
  const localePrefix = locale === siteConfig.defaultLocale ? "" : trimSlashes(locale);
  const normalizedSlug = slug === "/" ? "" : trimSlashes(slug);
  const parts = [localePrefix, normalizedSlug].filter((part) => part.length > 0);

  return parts.length === 0 ? "/" : `/${parts.join("/")}`;
}

export function slugToRouteParam(slug: string): string {
  return trimSlashes(slug);
}
