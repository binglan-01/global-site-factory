import type { Section, SiteConfig } from "@factory/validators";
import { getThemeBundle } from "../themes/registry";

export type SectionRendererProps = {
  section: Section;
  siteConfig: SiteConfig;
  siteSlug: string;
  pageUrl: string;
};

export function SectionRenderer({ pageUrl, section, siteConfig, siteSlug }: SectionRendererProps) {
  const {
    CaseStudies,
    Certificates,
    ContactBlock,
    ContactForm,
    FAQ,
    FeatureList,
    Gallery,
    Hero,
    ImageText,
    ProcessSteps,
    ServicesGrid,
    Stats,
  } = getThemeBundle(siteConfig.theme);

  switch (section.type) {
    case "hero":
      /* THIS IS TEMPLATE COUPLING POINT — split-carousel hero hydration is handled only in SectionBlock.astro */
      if (
        siteConfig.theme === "technical-product-showcase" &&
        section.variant === "split-carousel" &&
        section.carousel?.images &&
        section.carousel.images.length > 0
      ) {
        return null;
      }
      if (
        siteConfig.theme === "energy-storage-showcase" &&
        section.variant === "fullscreen-carousel" &&
        section.carousel?.images &&
        section.carousel.images.length > 0
      ) {
        return null;
      }
      return <Hero section={section} />;
    case "services-grid":
      return <ServicesGrid section={section} />;
    case "gallery":
      return <Gallery section={section} />;
    case "contact-form":
      return <ContactForm section={section} siteSlug={siteSlug} pageUrl={pageUrl} />;
    case "feature-list":
      /* ESS `variant: "scroll-mask-carousel"` is hydrated in SectionBlock.astro (client:visible). */
      return <FeatureList section={section} />;
    case "image-text":
      return <ImageText section={section} />;
    case "case-studies":
      return <CaseStudies section={section} />;
    case "process-steps":
      return <ProcessSteps section={section} />;
    case "stats":
      return <Stats section={section} />;
    case "faq":
      return <FAQ section={section} />;
    case "certificates":
      return <Certificates section={section} />;
    case "contact-block":
      return (
        <ContactBlock
          section={section}
          email={siteConfig.company.email}
          phone={siteConfig.company.phone}
        />
      );
    default: {
      const exhaustiveCheck: never = section;
      throw new Error(`Unknown section type: ${JSON.stringify(exhaustiveCheck)}`);
    }
  }
}
