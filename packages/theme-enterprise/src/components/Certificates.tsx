import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type CertificatesSection = Extract<Section, { type: "certificates" }>;
export type CertificateItem = CertificatesSection["items"][number];

export type CertificatesProps = {
  section: CertificatesSection;
  className?: string;
};

export function Certificates({ className, section }: CertificatesProps) {
  const sectionClassName = ["enterprise-certificates", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="enterprise-certificates__container">
        <Heading className="enterprise-certificates__title">{section.title}</Heading>
        <Grid className="enterprise-certificates__grid">
          {section.items.map((item) => (
            <Card className="enterprise-certificates__item" key={item.title}>
              {item.image ? (
                <ImageBlock alt="" className="enterprise-certificates__image" src={item.image} />
              ) : null}
              <Heading level={3}>{item.title}</Heading>
              {item.description ? <Text>{item.description}</Text> : null}
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
