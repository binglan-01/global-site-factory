import type { FeatureListProps as EnterpriseFeatureProps } from "@factory/theme-enterprise";

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

  return <ScrollRevealShowcase items={items} sectionDescription={section.description} sectionTitle={section.title} />;
}
