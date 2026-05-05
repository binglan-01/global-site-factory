import type { FeatureListProps as EnterpriseFeatureProps } from "@factory/theme-enterprise";

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

  return <ScrollRevealShowcase items={items} sectionDescription={section.description} sectionTitle={section.title} />;
}
