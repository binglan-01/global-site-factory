import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "beta-saas",
  company: {
    legalName: "Beta SaaS Inc.",
    displayName: "Beta SaaS",
    registeredCountry: "United States",
    registeredAddress: "500 Market Street, Suite 2100, San Francisco, CA 94105, United States",
    email: "hello@beta-saas.com",
    phone: "+1 415 555 0142",
  },
  domain: "https://www.beta-saas.com",
  industry: "saas",
  theme: "enterprise",
  locales: ["en"],
  defaultLocale: "en",
  navigation: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Services",
      href: "/services",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  footerLinkLabels: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
  },
  seo: {
    defaultTitle: "Beta SaaS",
    titleTemplate: "%s | Beta SaaS",
    defaultDescription:
      "Beta SaaS helps technology teams streamline operations with cloud software, workflow automation, and product analytics.",
  },
  legal: {
    privacyEmail: "privacy@beta-saas.com",
    dataController: "Beta SaaS Inc.",
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: "beta-saas",
  },
});
