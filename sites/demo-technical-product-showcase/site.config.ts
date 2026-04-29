import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "demo-technical-product-showcase",
  company: {
    legalName: "Technical Product Showcase Demo Co.",
    displayName: "Technical Product Showcase Demo",
    registeredCountry: "United States",
    registeredAddress: "100 Innovation Way, Suite 500, San Jose, CA 95110, United States",
    email: "demo@example.com",
    phone: "+1 555 010 0100",
    whatsapp: "+1 555 010 0100",
  },
  domain: "https://demo-technical-product-showcase.example.com",
  industry: "B2B technical product showcase (demo)",
  theme: "technical-product-showcase",
  locales: ["en"],
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
      label: "Projects",
      href: "/projects",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
    {
      label: "Sections",
      href: "/sections-showcase",
    },
  ],
  seo: {
    defaultTitle: "Technical Product Showcase Demo",
    titleTemplate: "%s | Technical Product Showcase Demo",
    defaultDescription:
      "Demo site for the technical-product-showcase theme. Exercises smart equipment, industrial technology, energy equipment, and modular product showcase patterns for B2B audiences.",
  },
  legal: {
    privacyEmail: "privacy@example.com",
    dataController: "Technical Product Showcase Demo Co.",
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: "demo-technical-product-showcase",
  },
});
