/**
 * Either one string reused for every locale, or a map keyed by locale tag (e.g. en, zh).
 */
export type LocalizedString = string | Record<string, string>;

export function resolveLocalizedString(
  value: LocalizedString,
  locale: string,
  defaultLocale: string,
): string {
  if (typeof value === "string") {
    return value;
  }
  const fromLocale = value[locale];
  if (typeof fromLocale === "string" && fromLocale.length > 0) {
    return fromLocale;
  }
  const fallback = value[defaultLocale];
  if (typeof fallback === "string" && fallback.length > 0) {
    return fallback;
  }
  const first = Object.values(value).find((v) => typeof v === "string" && v.length > 0);
  return first ?? "";
}
