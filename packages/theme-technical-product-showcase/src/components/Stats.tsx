import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, Section as PageSection, Text } from "@factory/ui";

export type StatsSection = Extract<Section, { type: "stats" }>;
export type StatItem = StatsSection["items"][number];

export type StatsProps = {
  section: StatsSection;
  className?: string;
};

export function Stats({ className, section }: StatsProps) {
  const sectionClassName = ["tps-stats", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="tps-stats__container">
        <Grid className="tps-stats__grid" columns={4}>
          {section.items.map((item) => (
            <Card className="tps-stats__item" key={`${item.value}-${item.label}`}>
              <Text className="tps-stats__value">{item.value}</Text>
              <Heading className="tps-stats__label" level={3}>
                {item.label}
              </Heading>
              {item.description ? (
                <Text className="tps-stats__description">{item.description}</Text>
              ) : null}
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
