import { Heading, Section as PageSection, Text } from "@factory/ui";
import type { ServicesGridProps as ThemeSvcProps } from "@factory/theme-enterprise";

import { ProductSolutionTabs } from "./ProductSolutionTabs";

export type ServicesGridProps = ThemeSvcProps;

export function ServicesGrid({ section }: ServicesGridProps) {
  const allHaveHref =
    section.items.length > 0 && section.items.every((item) => typeof item.href === "string");
  const showSolutionTabs = allHaveHref && section.suppressSolutionTabs !== true;

  return (
    <PageSection className="energy-storage-services">
      <div className="energy-storage-services__head">
        <Heading className="energy-storage-services__title" level={2}>
          {section.title}
        </Heading>
      </div>
      {showSolutionTabs ? (
        <ProductSolutionTabs
          items={section.items.map((item) => ({
            href: item.href!,
            label: item.title,
          }))}
        />
      ) : null}
      <div className="energy-storage-services__tiles">
        {section.items.map((item) =>
          item.href ? (
            <a
              className="energy-storage-services__card energy-storage-services__card--link"
              href={item.href}
              key={`${item.title}-${item.href}`}
            >
              <Heading className="energy-storage-services__card-title" level={3}>
                {item.title}
              </Heading>
              <Text className="energy-storage-services__card-text">{item.description}</Text>
              {item.cardCtaLabel !== undefined && item.cardCtaLabel.length > 0 ? (
                <span className="energy-storage-services__card-footer-cta">{item.cardCtaLabel}</span>
              ) : null}
            </a>
          ) : (
            <article className="energy-storage-services__card" key={`${item.title}-nh`}>
              <Heading className="energy-storage-services__card-title" level={3}>
                {item.title}
              </Heading>
              <Text className="energy-storage-services__card-text">{item.description}</Text>
            </article>
          ),
        )}
      </div>
    </PageSection>
  );
}
