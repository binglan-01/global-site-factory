import { Button, Heading, Section as PageSection, Text } from "@factory/ui";
import type { Section } from "@factory/validators";

export type CaseStudiesSection = Extract<Section, { type: "case-studies" }>;

export type NewsActivityGridProps = {
  section: CaseStudiesSection;
};

export function NewsActivityGrid({ section }: NewsActivityGridProps) {
  return (
    <PageSection className="energy-storage-news-grid">
      <div className="energy-storage-news-grid__head">
        <Heading className="energy-storage-news-grid__title" level={2}>
          {section.title}
        </Heading>
      </div>
      <div className="energy-storage-news-grid__cards">
        {section.items.map((item, index) => (
          <article className="energy-storage-news-card" key={`${item.title}-${index}`}>
            {item.image ? (
              <div
                aria-hidden="true"
                className="energy-storage-news-card__cover"
                role="presentation"
                style={{ backgroundImage: `url(${JSON.stringify(item.image)})` }}
              />
            ) : (
              <div aria-hidden className="energy-storage-news-card__cover energy-storage-news-card__cover--empty" />
            )}
            <div className="energy-storage-news-card__body">
              {item.industry ? (
                <p className="energy-storage-news-card__tag">{item.industry}</p>
              ) : null}
              <Heading className="energy-storage-news-card__title" level={3}>
                {item.title}
              </Heading>
              {item.location ? <Text className="energy-storage-news-card__loc">{item.location}</Text> : null}
              <Text>{item.description}</Text>
            </div>
          </article>
        ))}
      </div>
      <div className="energy-storage-news-grid__actions">
        {section.primaryCta ? (
          <Button className="energy-storage-news-grid__btn" href={section.primaryCta.href}>
            {section.primaryCta.label}
          </Button>
        ) : null}
        {section.secondaryCta ? (
          <Button className="energy-storage-news-grid__btn-secondary" href={section.secondaryCta.href}>
            {section.secondaryCta.label}
          </Button>
        ) : null}
      </div>
    </PageSection>
  );
}
