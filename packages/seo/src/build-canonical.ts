function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

export function buildCanonical(
  domain: string,
  locale: string,
  slug: string,
  defaultLocale: string,
): string {
  const normalizedDomain = trimTrailingSlash(domain);
  const localePrefix = locale === defaultLocale ? "" : trimSlashes(locale);
  const normalizedSlug = slug === "/" ? "" : trimSlashes(slug);
  const pathParts = [localePrefix, normalizedSlug].filter((part) => part.length > 0);

  if (pathParts.length === 0) {
    return normalizedDomain;
  }

  return `${normalizedDomain}/${pathParts.join("/")}`;
}
