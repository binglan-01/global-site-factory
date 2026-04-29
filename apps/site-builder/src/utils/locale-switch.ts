import type { SiteConfig } from "@factory/validators";
import { buildLocalizedPath } from "./route";

export type LanguageLink = {
  label: string;
  href: string;
  locale: string;
  current: boolean;
};

/**
 * Human-readable short labels for the locale switcher (e.g. "EN", autonym for other locales via Intl).
 */
export function localeSwitchLabel(locale: string): string {
  const lower = locale.toLowerCase();
  if (lower === "en" || lower.startsWith("en-")) {
    return "EN";
  }

  try {
    const display = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
    if (display) {
      return display;
    }
  } catch {
    /* invalid locale tag for Intl — fall through */
  }

  return locale;
}

export function buildLanguageLinks(
  siteConfig: SiteConfig,
  currentLocale: string,
  pageSlug: string,
): LanguageLink[] | undefined {
  if (siteConfig.locales.length < 2) {
    return undefined;
  }

  return siteConfig.locales.map((loc) => ({
    label: localeSwitchLabel(loc),
    locale: loc,
    href: buildLocalizedPath(siteConfig, loc, pageSlug),
    current: loc === currentLocale,
  }));
}
