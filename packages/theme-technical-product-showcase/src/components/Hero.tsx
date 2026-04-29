import type { CSSProperties } from "react";
import type { Section } from "@factory/validators";
import { Button, Container, Heading, Text } from "@factory/ui";
import { HeroSplitCarousel } from "./HeroSplitCarousel";

export type HeroSection = Extract<Section, { type: "hero" }>;

export type HeroProps = {
  section: HeroSection;
};

export function Hero({ section }: HeroProps) {
  if (
    section.variant === "split-carousel" &&
    section.carousel?.images &&
    section.carousel.images.length > 0
  ) {
    return <HeroSplitCarousel section={section} />;
  }

  const imageUrl = section.image;
  const heroClassName = ["tps-hero", imageUrl ? null : "tps-hero--no-image"]
    .filter(Boolean)
    .join(" ");
  const ariaLabel = section.imageAlt ?? section.title;
  const heroStyle: CSSProperties | undefined = imageUrl
    ? { backgroundImage: `url(${JSON.stringify(imageUrl)})` }
    : undefined;

  return (
    <section aria-label={ariaLabel} className={heroClassName} style={heroStyle}>
      <Container className="tps-hero__container">
        <div className="tps-hero__content">
          {section.eyebrow ? (
            <p className="tps-hero__eyebrow">{section.eyebrow}</p>
          ) : null}
          <Heading className="tps-hero__title" level={1}>
            {section.title}
          </Heading>
          <Text className="tps-hero__description">{section.description}</Text>
          {section.primaryCta ? (
            <Button className="tps-hero__cta" href={section.primaryCta.href}>
              {section.primaryCta.label}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
