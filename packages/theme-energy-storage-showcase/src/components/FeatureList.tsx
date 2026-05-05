import type { FeatureListProps as EnterpriseFeatureProps } from "@factory/theme-enterprise";

import { ProductScenarioSection } from "./ProductScenarioSection";
import { ScrollMaskRevealCarousel } from "./ScrollMaskRevealCarousel";
import { ScrollRevealShowcase } from "./ScrollRevealShowcase";

export type FeatureListProps = EnterpriseFeatureProps;

export function FeatureList({ section }: FeatureListProps) {
  const items = section.items.map((item) => ({
    description: item.description,
    icon: item.icon,
    image: item.image,
    imageAlt: item.imageAlt,
    title: item.title,
  }));

  if (section.variant === "scroll-mask-carousel") {
    return <ScrollMaskRevealCarousel section={section} />;
  }

  if (section.variant === "product-scenario") {
    const anchorId = section.anchorId;
    const scenarioImage = section.scenarioImage;
    if (anchorId === undefined || scenarioImage === undefined) {
      return null;
    }

    return (
      <ProductScenarioSection
        anchorId={anchorId}
        cta={section.cta}
        description={section.description ?? ""}
        items={section.items.map((item) => ({ description: item.description, title: item.title }))}
        scenarioImage={scenarioImage}
        scenarioImageAlt={section.scenarioImageAlt}
        title={section.title}
      />
    );
  }

  return <ScrollRevealShowcase items={items} sectionDescription={section.description} sectionTitle={section.title} />;
}
