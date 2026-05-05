/**
 * Scaffolding body only — no executable imports from workspace packages here.
 * The create-site tool prepends the standard module import preamble when generating `sites/<slug>/site.config.ts`.
 */
export const brand = {
  name: {
    en: "{{DISPLAY_NAME_EN}}",
    zh: "{{DISPLAY_NAME_ZH}}",
  },
} as const;

export const navigation = {
  en: ["Home", "Contact", "Privacy", "Terms"],
  zh: ["首页", "联系", "隐私", "条款"],
} as const;

const NAVIGATION_HREFS = ["/", "/contact", "/privacy", "/terms"] as const;

export const companyProfile = {
  legalName: "{{LEGAL_NAME}}",
  registeredCountry: "{{REGISTERED_COUNTRY}}",
  registeredAddress: "{{REGISTERED_ADDRESS}}",
  email: "hello@{{PRIMARY_HOST}}",
  phone: "+1 555 010 0000",
  whatsapp: "+1 555 010 0000",
} as const;

export const siteSeoPitch = {
  industry: "{{INDUSTRY}}",
  defaultDescription: "{{DEFAULT_DESCRIPTION_EN}}",
} as const;

export const footerCopy = {
  privacy: { en: "Privacy policy", zh: "隐私政策" },
  terms: { en: "Terms of use", zh: "使用条款" },
} as const;

export const legalProfile = {
  privacyEmail: "privacy@{{PRIMARY_HOST}}",
  dataController: "{{LEGAL_NAME}}",
} as const;

export const siteMeta = {
  slug: "{{SITE_SLUG}}",
  domain: "{{DOMAIN}}",
  deployProjectName: "{{DEPLOY_PROJECT_NAME}}",
} as const;

function buildNavigationItems(): {
  readonly href: (typeof NAVIGATION_HREFS)[number];
  readonly label: { en: string; zh: string };
}[] {
  const { en: enLabels, zh: zhLabels } = navigation;
  if (enLabels.length !== zhLabels.length || enLabels.length !== NAVIGATION_HREFS.length) {
    throw new Error("Site template: navigation en / zh / NAVIGATION_HREFS length mismatch.");
  }
  return NAVIGATION_HREFS.map((href, index) => ({
    href,
    label: { en: enLabels[index] ?? "", zh: zhLabels[index] ?? "" },
  }));
}

export const siteConfig = {
  brand,
  navigation,
} as const;

export default defineSiteConfig({
  slug: siteMeta.slug,
  company: {
    legalName: companyProfile.legalName,
    displayName: { en: brand.name.en, zh: brand.name.zh },
    registeredCountry: companyProfile.registeredCountry,
    registeredAddress: companyProfile.registeredAddress,
    email: companyProfile.email,
    phone: companyProfile.phone,
    whatsapp: companyProfile.whatsapp,
  },
  domain: siteMeta.domain,
  industry: siteSeoPitch.industry,
  theme: "technical-product-showcase",
  locales: ["en", "zh"],
  defaultLocale: "en",
  navigation: buildNavigationItems(),
  footerLinkLabels: {
    privacy: footerCopy.privacy,
    terms: footerCopy.terms,
  },
  seo: {
    defaultTitle: brand.name.en,
    titleTemplate: "%s | {{DISPLAY_NAME_EN}}",
    defaultDescription: siteSeoPitch.defaultDescription,
  },
  legal: {
    privacyEmail: legalProfile.privacyEmail,
    dataController: legalProfile.dataController,
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: siteMeta.deployProjectName,
  },
});
