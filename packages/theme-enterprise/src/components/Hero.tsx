import type { Section } from "@factory/validators";
import { Badge, Button, Container, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type HeroSection = Extract<Section, { type: "hero" }>;

export type HeroProps = {
  section: HeroSection;
};

export function Hero({ section }: HeroProps) {
  return (
    <PageSection className="enterprise-hero">
      <Container className="enterprise-hero__container">
        {section.eyebrow ? <Badge className="enterprise-hero__eyebrow">{section.eyebrow}</Badge> : null}
        <Heading className="enterprise-hero__title" level={1}>
          {section.title}
        </Heading>
        <Text className="enterprise-hero__description">{section.description}</Text>
        {section.primaryCta ? (
          <Button className="enterprise-hero__cta" href={section.primaryCta.href}>
            {section.primaryCta.label}
          </Button>
        ) : null}
        {section.image ? (
          <ImageBlock
            alt={section.imageAlt ?? ""}
            className="enterprise-hero__image"
            src={section.image}
          />
        ) : null}
      </Container>
    </PageSection>
  );
}
