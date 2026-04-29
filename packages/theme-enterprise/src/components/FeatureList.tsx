import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, Section as PageSection, Text } from "@factory/ui";

export type FeatureListSection = Extract<Section, { type: "feature-list" }>;
export type FeatureListItem = FeatureListSection["items"][number];

export type FeatureListProps = {
  section: FeatureListSection;
  className?: string;
};

export function FeatureList({ className, section }: FeatureListProps) {
  const sectionClassName = ["enterprise-feature-list", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="enterprise-feature-list__container">
        <Heading className="enterprise-feature-list__title">{section.title}</Heading>
        {section.description ? (
          <Text className="enterprise-feature-list__description">{section.description}</Text>
        ) : null}
        <Grid className="enterprise-feature-list__grid">
          {section.items.map((item) => (
            <Card className="enterprise-feature-list__item" key={item.title}>
              {item.icon ? (
                <Text aria-hidden="true" className="enterprise-feature-list__icon">
                  {item.icon}
                </Text>
              ) : null}
              <Heading level={3}>{item.title}</Heading>
              <Text>{item.description}</Text>
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
