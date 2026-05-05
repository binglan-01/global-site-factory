import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "energy-storage-enclosure",
  company: {
    legalName: "Glorich Energy Equipment Co., Ltd. (placeholder — replace before production)",
    displayName: {
      en: "Glorich Energy",
      zh: "国兰智能装备",
    },
    registeredCountry: "China",
    registeredAddress: "Replace with the legal registered address used in filings and contracts.",
    email: "hello@energy-storage-enclosure.example.com",
    phone: "+86 000-0000-0000 (placeholder)",
  },
  domain: "https://energy-storage-enclosure.example.com",
  industry:
    "Energy storage enclosures, battery cabinet systems and industrial energy equipment manufacturing (demo scaffold)",
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
    defaultTitle: "Glorich Energy",
    titleTemplate: "%s | Glorich Energy",
    defaultDescription:
      "Demo corporate site for industrial energy storage enclosures — replace all placeholder facts, imagery, and regulatory copy before launch.",
  },
  legal: {
    privacyEmail: "privacy@energy-storage-enclosure.example.com",
    dataController: "Glorich Energy Equipment Co., Ltd. (placeholder)",
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: "energy-storage-enclosure",
  },
});
