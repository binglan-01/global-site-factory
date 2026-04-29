import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSite } from "@factory/site-core";
import type { PageContent } from "@factory/validators";

const SITE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function getRepoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "..");
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function toDisplayName(siteSlug: string): string {
  return siteSlug
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function createHeroPage(
  slug: string,
  template: string,
  title: string,
  description: string,
  eyebrow: string,
  heroTitle: string,
  heroDescription: string,
): PageContent {
  return {
    slug,
    template,
    seo: {
      title,
      description,
    },
    sections: [
      {
        type: "hero",
        eyebrow,
        title: heroTitle,
        description: heroDescription,
        image: "/assets/placeholder.jpg",
      },
    ],
  };
}

function createPages(displayName: string): Record<string, PageContent> {
  return {
    "home.json": {
      slug: "/",
      template: "standard",
      seo: {
        title: `${displayName} Official Website`,
        description: `${displayName} provides practical business services and clear support for growing teams.`,
      },
      sections: [
        {
          type: "hero",
          eyebrow: "Company website",
          title: `Welcome to ${displayName}`,
          description: `${displayName} helps customers understand services, request information, and start a business conversation.`,
          primaryCta: {
            label: "Contact us",
            href: "/contact",
          },
          image: "/assets/placeholder.jpg",
        },
        {
          type: "services-grid",
          title: "Core services",
          items: [
            {
              title: "Consultation",
              description: "Structured conversations to understand goals, requirements, and next steps.",
            },
            {
              title: "Implementation",
              description: "Practical delivery support shaped around clear milestones and communication.",
            },
            {
              title: "Ongoing support",
              description: "Reliable follow-up for customers who need continuous operational assistance.",
            },
          ],
        },
        {
          type: "gallery",
          title: "Company overview",
          images: ["/assets/placeholder.jpg"],
        },
        {
          type: "contact-form",
          title: "Send an inquiry",
          formId: "home-lead",
        },
      ],
    },
    "about.json": {
      slug: "/about",
      template: "standard",
      seo: {
        title: `About ${displayName}`,
        description: `Learn more about ${displayName}, its approach, and how the company works with customers.`,
      },
      sections: [
        {
          type: "hero",
          eyebrow: "About",
          title: `About ${displayName}`,
          description: `${displayName} is a placeholder company profile ready to be customized for a real business.`,
          image: "/assets/placeholder.jpg",
        },
        {
          type: "services-grid",
          title: "How we work",
          items: [
            {
              title: "Clear scope",
              description: "Define expectations before work begins.",
            },
            {
              title: "Practical delivery",
              description: "Focus on useful outcomes and straightforward communication.",
            },
          ],
        },
      ],
    },
    "services.json": {
      slug: "/services",
      template: "standard",
      seo: {
        title: `${displayName} Services`,
        description: `Explore the services offered by ${displayName}.`,
      },
      sections: [
        {
          type: "hero",
          eyebrow: "Services",
          title: "Services built around customer needs",
          description: "Use this page to describe the company's main service lines and customer outcomes.",
          primaryCta: {
            label: "Request details",
            href: "/contact",
          },
          image: "/assets/placeholder.jpg",
        },
        {
          type: "services-grid",
          title: "Service areas",
          items: [
            {
              title: "Planning",
              description: "Understand requirements and shape a practical plan.",
            },
            {
              title: "Execution",
              description: "Deliver work with clear status and ownership.",
            },
            {
              title: "Support",
              description: "Help customers continue after launch.",
            },
          ],
        },
        {
          type: "contact-form",
          title: "Ask about services",
          formId: "services-lead",
        },
      ],
    },
    "contact.json": {
      slug: "/contact",
      template: "standard",
      seo: {
        title: `Contact ${displayName}`,
        description: `Contact ${displayName} to ask questions or request more information.`,
      },
      sections: [
        {
          type: "hero",
          eyebrow: "Contact",
          title: "Start a conversation",
          description: "Share a few details and the team will review your inquiry.",
          image: "/assets/placeholder.jpg",
        },
        {
          type: "contact-form",
          title: "Send a message",
          formId: "contact-lead",
        },
      ],
    },
    "privacy.json": createHeroPage(
      "/privacy",
      "legal",
      "Privacy Policy",
      `Privacy policy placeholder for ${displayName}.`,
      "Privacy",
      "Privacy Policy",
      "This placeholder privacy policy should be reviewed before launch.",
    ),
    "terms.json": createHeroPage(
      "/terms",
      "legal",
      "Terms of Use",
      `Terms of use placeholder for ${displayName}.`,
      "Terms",
      "Terms of Use",
      "These placeholder terms should be reviewed before launch.",
    ),
  };
}

async function assertSiteDoesNotExist(siteDir: string, siteSlug: string): Promise<void> {
  try {
    await access(siteDir);
  } catch {
    return;
  }

  throw new Error(`Site "${siteSlug}" already exists at ${siteDir}.`);
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const siteSlug = process.argv[2];

  if (!siteSlug) {
    throw new Error("Missing site slug. Usage: pnpm create-site <siteSlug>");
  }

  if (!SITE_SLUG_PATTERN.test(siteSlug)) {
    throw new Error(`Invalid site slug "${siteSlug}". Use lowercase kebab-case, for example gamma-energy.`);
  }

  const repoRoot = getRepoRoot();
  const siteDir = join(repoRoot, "sites", siteSlug);
  const pagesDir = join(siteDir, "content", "en", "pages");
  const assetsDir = join(siteDir, "assets");
  const displayName = toDisplayName(siteSlug);
  const siteConfig = `import { defineSiteConfig } from "@factory/validators";

export default defineSiteConfig({
  slug: "${siteSlug}",
  company: {
    legalName: "${displayName} LLC",
    displayName: "${displayName}",
    registeredCountry: "United States",
    registeredAddress: "100 Main Street, Suite 100, Wilmington, DE 19801, United States",
    email: "hello@${siteSlug}.com",
    phone: "+1 555 010 0000",
  },
  domain: "https://www.${siteSlug}.com",
  industry: "general business",
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
    defaultTitle: "${displayName}",
    titleTemplate: "%s | ${displayName}",
    defaultDescription: "${displayName} provides practical services for customers and partners.",
  },
  legal: {
    privacyEmail: "privacy@${siteSlug}.com",
    dataController: "${displayName} LLC",
  },
  deploy: {
    provider: "cloudflare-pages",
    projectName: "${siteSlug}",
  },
});
`;

  await assertSiteDoesNotExist(siteDir, siteSlug);
  await mkdir(pagesDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });
  await writeFile(join(siteDir, "site.config.ts"), siteConfig, "utf8");
  await writeFile(join(assetsDir, ".gitkeep"), "", "utf8");

  const pages = createPages(displayName);

  for (const [fileName, page] of Object.entries(pages)) {
    await writeJsonFile(join(pagesDir, fileName), page);
  }

  await loadSite(siteSlug);
  console.log(`Site "${siteSlug}" created successfully at ${siteDir}.`);
}

main().catch((error: unknown) => {
  console.error(`Failed to create site: ${formatUnknownError(error)}`);
  process.exit(1);
});
