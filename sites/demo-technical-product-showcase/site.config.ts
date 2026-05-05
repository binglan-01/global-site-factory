import { defineSiteConfig } from "@factory/validators";

/**
 * Clone this site under a new slug: change the blocks below plus domain / deploy / contacts.
 * `brand` + `navigation` mirror the authoring shape (`name` locales, parallel nav label arrays).
 */
export const brand = {
  name: {
    en: "Technical Product Showcase Demo",
    zh: "技术产品展示演示",
  },
} as const;

/** Navbar labels — must align index-for-index with `NAVIGATION_HREFS`. */
export const navigation = {
  en: [
    "Home",
    "Products",
    "Solutions",
    "Projects",
    "About",
    "Contact",
    "Sections",
  ],
  zh: [
    "首页",
    "产品",
    "解决方案",
    "项目案例",
    "关于我们",
    "联系我们",
    "组件展示",
  ],
} as const;

const NAVIGATION_HREFS = [
  "/",
  "/products",
  "/solutions",
  "/projects",
  "/about",
  "/contact",
  "/sections-showcase",
] as const;

/** Legal / transactional identity (distinct from marketing `brand.name`). */
export const companyProfile = {
  legalName: "Technical Product Showcase Demo Co.",
  registeredCountry: "United States",
  registeredAddress: "100 Innovation Way, Suite 500, San Jose, CA 95110, United States",
  email: "demo@example.com",
  phone: "+1 555 010 0100",
  whatsapp: "+1 555 010 0100",
} as const;

export const siteSeoPitch = {
  industry: "B2B technical product showcase (demo)",
  defaultDescription:
    "Demo site for the technical-product-showcase theme. Exercises smart equipment, industrial technology, energy equipment, and modular product showcase patterns for B2B audiences.",
} as const;

/** Footer Privacy / Terms link labels resolved per locale via SiteLayout + `resolveLocalizedString`. */
export const footerCopy = {
  privacy: { en: "Privacy", zh: "隐私政策" },
  terms: { en: "Terms", zh: "服务条款" },
} as const;

export const legalProfile = {
  privacyEmail: "privacy@example.com",
  /** Often the same entity as legalName; surfaced in schema / legal prose. */
  dataController: companyProfile.legalName,
} as const;

export const siteMeta = {
  slug: "demo-technical-product-showcase",
  domain: "https://demo-technical-product-showcase.example.com",
  deployProjectName: "demo-technical-product-showcase",
} as const;

function buildNavigationItems(): {
  readonly href: (typeof NAVIGATION_HREFS)[number];
  readonly label: { en: string; zh: string };
}[] {
  const { en: enLabels, zh: zhLabels } = navigation;
  if (enLabels.length !== zhLabels.length || enLabels.length !== NAVIGATION_HREFS.length) {
    throw new Error(
      "demo-technical-product-showcase: navigation en / zh / NAVIGATION_HREFS length mismatch.",
    );
  }
  return NAVIGATION_HREFS.map((href, index) => ({
    href,
    label: { en: enLabels[index] ?? "", zh: zhLabels[index] ?? "" },
  }));
}

/** Authoring entrypoint for clones; default export is the framework `SiteConfig`. */
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
  locales: ["en"],
  defaultLocale: "en",
  navigation: buildNavigationItems(),
  footerLinkLabels: {
    privacy: footerCopy.privacy,
    terms: footerCopy.terms,
  },
  seo: {
    defaultTitle: brand.name.en,
    titleTemplate: `%s | ${brand.name.en}`,
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
