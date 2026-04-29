import type { Section } from "@factory/validators";
import { Button, Container, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type ImageTextSection = Extract<Section, { type: "image-text" }>;
export type ImageTextCta = NonNullable<ImageTextSection["cta"]>;

export type ImageTextProps = {
  section: ImageTextSection;
  className?: string;
};

export function ImageText({ className, section }: ImageTextProps) {
  const imagePosition = section.reverse ? "left" : "right";
  const sectionClassName = [
    "enterprise-image-text",
    `enterprise-image-text--${imagePosition}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="enterprise-image-text__container">
        <div className="enterprise-image-text__content">
          <Heading className="enterprise-image-text__title">{section.title}</Heading>
          <Text className="enterprise-image-text__description">{section.description}</Text>
          {section.cta ? (
            <Button className="enterprise-image-text__cta" href={section.cta.href}>
              {section.cta.label}
            </Button>
          ) : null}
        </div>
        {section.image ? (
          <ImageBlock
            alt={section.imageAlt ?? ""}
            className="enterprise-image-text__image"
            src={section.image}
          />
        ) : null}
      </Container>
    </PageSection>
  );
}
