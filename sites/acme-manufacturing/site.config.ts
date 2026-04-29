import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "acme-manufacturing",
  company: {
    legalName: "Acme Manufacturing Ltd.",
    displayName: "Acme Manufacturing",
    registeredCountry: "United States",
    registeredAddress: "1200 Industrial Parkway, Suite 400, Chicago, IL 60601, United States",
    email: "info@acme-manufacturing.com",
    phone: "+1 312 555 0198",
    whatsapp: "+1 312 555 0198",
  },
  domain: "https://www.acme-manufacturing.com",
  industry: "Industrial manufacturing",
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
  seo: {
    defaultTitle: "Acme Manufacturing",
    titleTemplate: "%s | Acme Manufacturing",
    defaultDescription:
      "Acme Manufacturing provides precision production, assembly, and supply chain support for industrial companies.",
  },
  legal: {
    privacyEmail: "privacy@acme-manufacturing.com",
    dataController: "Acme Manufacturing Ltd.",
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: "acme-manufacturing",
  },
});
