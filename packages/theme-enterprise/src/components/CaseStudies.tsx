import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type CaseStudiesSection = Extract<Section, { type: "case-studies" }>;
export type CaseStudyItem = CaseStudiesSection["items"][number];

export type CaseStudiesProps = {
  section: CaseStudiesSection;
  className?: string;
};

export function CaseStudies({ className, section }: CaseStudiesProps) {
  const sectionClassName = ["enterprise-case-studies", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="enterprise-case-studies__container">
        <Heading className="enterprise-case-studies__title">{section.title}</Heading>
        <Grid className="enterprise-case-studies__grid">
          {section.items.map((item) => (
            <Card className="enterprise-case-studies__item" key={item.title}>
              {item.image ? (
                <ImageBlock alt="" className="enterprise-case-studies__image" src={item.image} />
              ) : null}
              <Heading level={3}>{item.title}</Heading>
              {item.industry || item.location ? (
                <Text className="enterprise-case-studies__meta">
                  {[item.industry, item.location].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
              <Text>{item.description}</Text>
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
