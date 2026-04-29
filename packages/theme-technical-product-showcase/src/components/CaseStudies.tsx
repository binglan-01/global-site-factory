import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type CaseStudiesSection = Extract<Section, { type: "case-studies" }>;
export type CaseStudyItem = CaseStudiesSection["items"][number];

export type CaseStudiesProps = {
  section: CaseStudiesSection;
  className?: string;
};

export function CaseStudies({ className, section }: CaseStudiesProps) {
  const sectionClassName = ["tps-case-studies", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="tps-case-studies__container">
        <Heading className="tps-case-studies__title">{section.title}</Heading>
        <Grid className="tps-case-studies__grid">
          {section.items.map((item) => (
            <Card className="tps-case-studies__item" key={item.title}>
              {item.image ? (
                <ImageBlock alt="" className="tps-case-studies__image" src={item.image} />
              ) : null}
              <div className="tps-case-studies__body">
                {item.industry || item.location ? (
                  <Text className="tps-case-studies__meta">
                    {[item.industry, item.location].filter(Boolean).join(" · ")}
                  </Text>
                ) : null}
                <Heading className="tps-case-studies__item-title" level={3}>
                  {item.title}
                </Heading>
                <Text className="tps-case-studies__item-description">{item.description}</Text>
              </div>
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
