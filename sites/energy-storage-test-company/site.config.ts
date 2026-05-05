import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "energy-storage-test-company",
  company: {
    legalName:
      "Voltpack Enclosure Demonstration Entity (PLACEHOLDER — replace before any public filing)",
    displayName: {
      en: "Voltpack Enclosure",
      zh: "伏特储能装备",
    },
    registeredCountry: "Germany",
    registeredAddress:
      "PLACEHOLDER factory / registered office address — substitute with audited legal filings before launch.",
    email: "hello@energy-storage-test-company.example.com",
    phone: "+49 (0)000 0000000 (PLACEHOLDER — replace)",
  },
  domain: "https://energy-storage-test-company.example.com",
  industry:
    "Industrial B2B: energy storage containers, liquid-cooled cabinet enclosures, C&I outdoor battery housings and custom sheet-metal (demo scaffold only)",
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
      title: { en: "Products", zh: "产品与结构" },
      links: [
        {
          label: { en: "Containerized enclosures", zh: "储能集装箱外壳（占位路线）" },
          href: "/products#container",
        },
        {
          label: { en: "Liquid-cooled shells", zh: "液冷储能柜外壳（占位路线）" },
          href: "/products#liquid-cooling",
        },
        {
          label: { en: "C&I cabinet lines", zh: "工商业储能柜外壳（占位路线）" },
          href: "/products#ci-commercial",
        },
        {
          label: { en: "Outdoor battery housings", zh: "户外电池柜（占位路线）" },
          href: "/products#outdoor-shell",
        },
        {
          label: { en: "Custom sheet metal", zh: "定制钣金结构件（占位路线）" },
          href: "/products#fabrication",
        },
      ],
    },
    {
      title: { en: "Solutions", zh: "解决方案入口" },
      links: [
        {
          label: { en: "Factory-fit integration", zh: "厂内模块化集成占位" },
          href: "/solutions#factory-fit",
        },
        {
          label: { en: "Field deployment envelopes", zh: "现场整机防护占位" },
          href: "/solutions#field-deploy",
        },
        {
          label: { en: "Lifecycle service hooks", zh: "运维与服务接口占位" },
          href: "/solutions#maintenance-hooks",
        },
      ],
    },
    {
      title: { en: "Support", zh: "支持与资料" },
      links: [
        { label: { en: "Request drawings (demo)", zh: "图纸索取占位" }, href: "/contact" },
        { label: { en: "After-sales inbox (demo)", zh: "售后邮箱占位说明" }, href: "/contact" },
      ],
    },
    {
      title: { en: "Company", zh: "公司信息" },
      links: [
        { label: { en: "About Voltpack demo", zh: "关于占位主体" }, href: "/about" },
        {
          label: { en: "Manufacturing storyline", zh: "制造叙事占位（无承诺）" },
          href: "/about",
        },
      ],
    },
    {
      title: { en: "Contact", zh: "联系我们" },
      links: [
        {
          label: { en: "Business development", zh: "商务与技术窗口占位" },
          href: "/contact",
        },
        { label: { en: "Project desk", zh: "项目收件占位" }, href: "/contact" },
      ],
    },
  ],
  floatingActions: {
    enquiry: {
      enabled: true,
      href: "/contact",
      label: { en: "Discuss project", zh: "项目洽询" },
      ariaLabel: { en: "Open contact page", zh: "前往联系页面" },
    },
    document: {
      enabled: true,
      href: "/contact",
      label: { en: "Specs inbox", zh: "资料索取" },
      ariaLabel: { en: "Request specification pack", zh: "请求规格资料包占位" },
    },
    support: {
      enabled: true,
      href: "/contact",
      label: { en: "Service desk", zh: "服务台" },
      ariaLabel: { en: "Open support messaging", zh: "打开支持联络占位" },
    },
    backToTop: {
      enabled: true,
      label: { en: "Top", zh: "顶部" },
      ariaLabel: { en: "Back to top", zh: "返回页面顶部" },
    },
  },
  seo: {
    defaultTitle: "Voltpack Enclosure",
    titleTemplate: "%s | Voltpack Enclosure · demo",
    defaultDescription:
      "PLACEHOLDER marketing copy — Voltpack Enclosure demo scaffold for ESS theme reuse testing. Replace metrics, approvals, imagery, contacts, and jurisdictional disclosures before publishing.",
  },
  legal: {
    privacyEmail: "privacy@energy-storage-test-company.example.com",
    dataController:
      "Voltpack Enclosure Demonstration Entity (PLACEHOLDER controller string — revise with counsel)",
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: "energy-storage-test-company",
  },
});
