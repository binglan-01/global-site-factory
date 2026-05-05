import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "{{SITE_SLUG}}",
  company: {
    legalName:
      "{{DISPLAY_NAME_EN}} legal entity placeholder — replace before production with filings-accurate name",
    displayName: {
      en: "{{DISPLAY_NAME_EN}}",
      zh: "{{DISPLAY_NAME_ZH}}",
    },
    registeredCountry:
      "REPLACE_ME — jurisdiction as used in filings and contracts (ASCII placeholder for reviewers)",
    registeredAddress:
      "REPLACE_ME — legal registered address as used in filings and contracts (ASCII placeholder for reviewers)",
    email: "hello@{{PRIMARY_HOST}}",
    phone: "+86 000-0000-0000 (placeholder — replace)",
  },
  domain: "{{DOMAIN}}",
  industry:
    "Energy storage enclosures, battery cabinet systems and industrial energy equipment manufacturing (ESS template — replace with vetted wording)",
  theme: "energy-storage-showcase",
  locales: ["en", "zh"],
  defaultLocale: "en",
  navigation: [
    { label: { en: "Home", zh: "首页" }, href: "/" },
    { label: { en: "Products", zh: "产品中心" }, href: "/products" },
    { label: { en: "Solutions", zh: "解决方案" }, href: "/solutions" },
    { label: { en: "Cases", zh: "案例展示" }, href: "/cases" },
    { label: { en: "About", zh: "关于我们" }, href: "/about" },
    { label: { en: "Contact", zh: "联系我们" }, href: "/contact" },
  ],
  footerLinkLabels: {
    privacy: { en: "Privacy", zh: "隐私政策" },
    terms: { en: "Terms", zh: "服务条款" },
  },
  footerColumns: [
    {
      title: { en: "Products", zh: "产品中心" },
      links: [
        { label: { en: "Utility-scale line", zh: "源网侧产品线" }, href: "/products#utility" },
        { label: { en: "C&I line", zh: "工商业产品线" }, href: "/products#ci" },
        { label: { en: "Residential line", zh: "户用产品线" }, href: "/products#residential" },
      ],
    },
    {
      title: { en: "Solutions", zh: "解决方案" },
      links: [
        { label: { en: "Grid-scale integration", zh: "源网侧集成" }, href: "/solutions#grid" },
        { label: { en: "Commercial projects", zh: "工商业场景" }, href: "/solutions#commercial" },
        { label: { en: "Edge backup", zh: "边缘备份电源" }, href: "/solutions#edge" },
      ],
    },
    {
      title: { en: "Support", zh: "服务支持" },
      links: [
        { label: { en: "Technical documents", zh: "技术文档（占位）" }, href: "/contact" },
        { label: { en: "After-sales inquiry", zh: "售后咨询（占位）" }, href: "/contact" },
      ],
    },
    {
      title: { en: "About", zh: "关于我们" },
      links: [
        { label: { en: "Company profile", zh: "公司简介" }, href: "/about" },
        { label: { en: "Quality & manufacturing", zh: "质量与制造" }, href: "/about" },
      ],
    },
    {
      title: { en: "Contact", zh: "联系我们" },
      links: [
        { label: { en: "Sales contact", zh: "销售联系" }, href: "/contact" },
        { label: { en: "Project intake", zh: "项目对接" }, href: "/contact" },
      ],
    },
  ],
  floatingActions: {
    enquiry: {
      enabled: true,
      href: "/contact",
      label: { en: "Consult", zh: "联系顾问" },
      ariaLabel: { en: "Open contact page", zh: "打开联系页面" },
    },
    document: {
      enabled: true,
      href: "/contact",
      label: { en: "Docs", zh: "资料" },
      ariaLabel: { en: "Request documentation", zh: "索取文档" },
    },
    support: {
      enabled: true,
      href: "/contact",
      label: { en: "Support", zh: "支持" },
      ariaLabel: { en: "Contact support", zh: "联系支持" },
    },
    backToTop: {
      enabled: true,
      label: { en: "Top", zh: "顶部" },
      ariaLabel: { en: "Back to top", zh: "返回页面顶部" },
    },
  },
  seo: {
    defaultTitle: "{{DISPLAY_NAME_EN}}",
    titleTemplate: "%s | {{DISPLAY_NAME_EN}}",
    defaultDescription:
      "ESS showcase template — bilingual industrial energy enclosure marketing scaffold. Replace placeholder imagery, contacts, figures, and legal copy before launch.",
  },
  legal: {
    privacyEmail: "privacy@{{PRIMARY_HOST}}",
    dataController:
      "{{DISPLAY_NAME_EN}} data controller placeholder — align wording with counsel and filings",
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: "{{DEPLOY_PROJECT_NAME}}",
  },
});
