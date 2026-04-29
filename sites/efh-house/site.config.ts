import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "efh-house",
  company: {
    // PRODUCTION legalName: "Anhui Easy Foldable Housing Co., Ltd."
    legalName: "EFH House Test Site (Not a production website)",
    // PRODUCTION displayName: "EFH House"
    displayName: "EFH House Test Site",
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
      label: "Home",
      href: "/",
    },
    {
      label: "Products",
      href: "/products",
    },
    {
      label: "Solutions",
      href: "/solutions",
    },
    {
      label: "Cases",
      href: "/cases",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "About Us",
      href: "/about",
    },
    {
      label: "Contact Us",
      href: "/contact",
    },
  ],
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
