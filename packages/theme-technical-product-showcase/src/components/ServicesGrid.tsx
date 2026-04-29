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
      <Heading className="tps-services__item-title" level={3}>
        {title}
      </Heading>
      <Text className="tps-services__item-description">{description}</Text>
    </>
  );
}

export function ServicesGrid({ section }: ServicesGridProps) {
  return (
    <PageSection className="tps-services">
      <Container className="tps-services__container">
        <Heading className="tps-services__title">{section.title}</Heading>
        <Grid className="tps-services__grid">
          {section.items.map((item, index) =>
            item.href ? (
              <a className="tps-services__item-link" href={item.href} key={`${item.title}-${String(index)}`}>
                <Card className="tps-services__item">
                  <ServicesGridCardBody description={item.description} title={item.title} />
                </Card>
              </a>
            ) : (
              <Card className="tps-services__item" key={`${item.title}-${String(index)}`}>
                <ServicesGridCardBody description={item.description} title={item.title} />
              </Card>
            ),
          )}
        </Grid>
      </Container>
    </PageSection>
  );
}
