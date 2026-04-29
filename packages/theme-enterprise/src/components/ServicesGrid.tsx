import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, Section as PageSection, Text } from "@factory/ui";

export type ServicesGridSection = Extract<Section, { type: "services-grid" }>;

export type ServicesGridProps = {
  section: ServicesGridSection;
};

function ServicesGridCardBody({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <>
      <Heading level={3}>{title}</Heading>
      <Text>{description}</Text>
    </>
  );
}

export function ServicesGrid({ section }: ServicesGridProps) {
  return (
    <PageSection className="enterprise-services">
      <Container className="enterprise-services__container">
        <Heading className="enterprise-services__title">{section.title}</Heading>
        <Grid className="enterprise-services__grid">
          {section.items.map((item, index) =>
            item.href ? (
              <a
                className="enterprise-services__item-link"
                href={item.href}
                key={`${item.title}-${String(index)}`}
              >
                <Card className="enterprise-services__item">
                  <ServicesGridCardBody description={item.description} title={item.title} />
                </Card>
              </a>
            ) : (
              <Card className="enterprise-services__item" key={`${item.title}-${String(index)}`}>
                <ServicesGridCardBody description={item.description} title={item.title} />
              </Card>
            ),
          )}
        </Grid>
      </Container>
    </PageSection>
  );
}
