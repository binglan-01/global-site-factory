import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type CertificatesSection = Extract<Section, { type: "certificates" }>;
export type CertificateItem = CertificatesSection["items"][number];

export type CertificatesProps = {
  section: CertificatesSection;
  className?: string;
};

export function Certificates({ className, section }: CertificatesProps) {
  const sectionClassName = ["tps-certificates", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="tps-certificates__container">
        <Heading className="tps-certificates__title">{section.title}</Heading>
        <Grid className="tps-certificates__grid" columns={4}>
          {section.items.map((item) => (
            <Card className="tps-certificates__item" key={item.title}>
              {item.image ? (
                <ImageBlock
                  alt={item.title}
                  className="tps-certificates__image"
                  src={item.image}
                />
              ) : null}
              <Heading className="tps-certificates__item-title" level={3}>
                {item.title}
              </Heading>
              {item.description ? (
                <Text className="tps-certificates__item-description">{item.description}</Text>
              ) : null}
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
