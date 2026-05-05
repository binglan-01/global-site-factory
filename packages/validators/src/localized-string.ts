/**
 * Either one string reused for every locale, or a map keyed by locale tag (e.g. en, zh).
 */
export type LocalizedString = string | Record<string, string>;

/** Visible neutral placeholder — avoids blank UI when translation data is missing. */
export const LOCALIZED_STRING_EMPTY_FALLBACK = "\u2014";

function isNonProductionEnvironment(): boolean {
  return typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production";
}

function warnResolveLocalizedEmpty(
  locale: string,
  defaultLocale: string,
  value: unknown,
): void {
  if (!isNonProductionEnvironment()) {
    return;
  }
  console.warn(
    "[@factory/validators] resolveLocalizedString: resolved to empty — check localized labels.",
    { locale, defaultLocale, value },
  );
}

export function resolveLocalizedString(
  value: LocalizedString,
  locale: string,
  defaultLocale: string,
): string {
  if (typeof value === "string") {
    if (value.length > 0) {
      return value;
    }
    warnResolveLocalizedEmpty(locale, defaultLocale, value);
    return LOCALIZED_STRING_EMPTY_FALLBACK;
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
  if (typeof first === "string" && first.length > 0) {
    return first;
  }
  warnResolveLocalizedEmpty(locale, defaultLocale, value);
  return LOCALIZED_STRING_EMPTY_FALLBACK;
}
