import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "efh-house",
  company: {
    // PRODUCTION legalName: "Anhui Easy Foldable Housing Co., Ltd."
    legalName: "EFH House Test Site (Not a production website)",
    // PRODUCTION displayName: "EFH House"
    displayName: {
      en: "EFH House Test Site",
      zh: "EFH House 测试站",
    },
    registeredCountry: "China",
    registeredAddress: "CHANGE_ME Registered Address",
    // PRODUCTION email: "info@efhhouse.com"
    email: "test-contact@example.com",
    // PRODUCTION phone: "+86 18355248224"
    phone: "+000 0000 0000",
    // PRODUCTION whatsapp: "+8618355248224"
    whatsapp: "+000000000000",
  },
  // PRODUCTION domain: "https://www.efh-house.com"
  domain: "https://efh-house-test.pages.dev",
  industry: "prefab-housing",
  theme: "technical-product-showcase",
  locales: ["en", "zh"],
  defaultLocale: "en",
  navigation: [
    {
      label: { en: "Home", zh: "首页" },
      href: "/",
    },
    {
      label: { en: "Products", zh: "产品" },
      href: "/products",
    },
    {
      label: { en: "Solutions", zh: "解决方案" },
      href: "/solutions",
    },
    {
      label: { en: "Cases", zh: "案例" },
      href: "/cases",
    },
    {
      label: { en: "Blog", zh: "博客" },
      href: "/blog",
    },
    {
      label: { en: "About Us", zh: "关于我们" },
      href: "/about",
    },
    {
      label: { en: "Contact Us", zh: "联系我们" },
      href: "/contact",
    },
  ],
  footerLinkLabels: {
    privacy: { en: "Privacy", zh: "隐私政策" },
    terms: { en: "Terms", zh: "使用条款" },
  },
  seo: {
    defaultTitle:
      "[TEST SITE] EFH House | Prefab Housing and Modular Building Solutions",
    // PRODUCTION titleTemplate: "%s | EFH House"
    titleTemplate: "%s | [TEST SITE] EFH House Test Site",
    defaultDescription:
      "This is a test deployment of the EFH House prefab housing website. It is used for Cloudflare Pages deployment testing and is not a production commercial website.",
  },
  legal: {
    // PRODUCTION privacyEmail: "privacy@efh-house.com"
    privacyEmail: "test-privacy@example.com",
    // PRODUCTION dataController: "Anhui Easy Foldable Housing Co., Ltd."
    dataController: "EFH House Test Site (Not a production legal entity)",
  },
  deploy: {
    provider: "cloudflare-pages",
    // PRODUCTION projectName: "efh-house"
    projectName: "efh-house-test",
  },
});
