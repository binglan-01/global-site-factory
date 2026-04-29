import type { Section } from "@factory/validators";
import { Card, Container, Grid, Section as PageSection, Heading, Text } from "@factory/ui";

export type StatsSection = Extract<Section, { type: "stats" }>;
export type StatItem = StatsSection["items"][number];

export type StatsProps = {
  section: StatsSection;
  className?: string;
};

export function Stats({ className, section }: StatsProps) {
  const sectionClassName = ["enterprise-stats", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="enterprise-stats__container">
        <Grid className="enterprise-stats__grid" columns={4}>
          {section.items.map((item) => (
            <Card className="enterprise-stats__item" key={`${item.value}-${item.label}`}>
              <Text className="enterprise-stats__value">{item.value}</Text>
              <Heading level={3}>{item.label}</Heading>
              {item.description ? <Text>{item.description}</Text> : null}
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
