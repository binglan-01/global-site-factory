import { Button, Heading, Section as PageSection, Text } from "@factory/ui";
import type { HeroProps as ThemeHeroProps } from "@factory/theme-enterprise";

import { FullScreenHeroCarousel } from "./FullScreenHeroCarousel";
import { ProductHero } from "./ProductHero";

export type HeroSection = ThemeHeroProps["section"];
export type HeroProps = ThemeHeroProps;

export function Hero({ section }: HeroProps) {
  if (
    section.variant === "fullscreen-carousel" &&
    section.carousel?.images &&
    section.carousel.images.length > 0
  ) {
    return (
      <FullScreenHeroCarousel
        carousel={section.carousel}
        eyebrow={section.eyebrow}
        primaryCta={section.primaryCta}
        subtitle={section.description}
        title={section.title}
      />
    );
  }

  if (section.variant === "product-hero") {
    return (
      <ProductHero
        description={section.description}
        eyebrow={section.eyebrow}
        hideTabFragmentAnchors={section.hideTabFragmentAnchors}
        image={section.image}
        imageAlt={section.imageAlt}
        primaryCta={section.primaryCta}
        tabs={section.tabs}
        title={section.title}
      />
    );
  }

  const imageUrl = section.image;
  const style =
    typeof imageUrl === "string"
      ? { backgroundImage: `url(${JSON.stringify(imageUrl)})` }
      : undefined;

  return (
    <PageSection className={`energy-storage-hero-plain ${imageUrl ? "" : "energy-storage-hero-plain--muted"}`.trim()}>
      <div aria-label={section.imageAlt ?? section.title} className="energy-storage-hero-plain__media" role="presentation" style={style} />
      <div className="energy-storage-hero-plain__overlay" />
      <div className="energy-storage-hero-plain__content">
        {section.eyebrow ? <p className="energy-storage-hero-plain__eyebrow">{section.eyebrow}</p> : null}
        <Heading className="energy-storage-hero-plain__title" level={1}>
          {section.title}
        </Heading>
        <Text className="energy-storage-hero-plain__subtitle">{section.description}</Text>
        {section.primaryCta ? (
          <Button className="energy-storage-hero-plain__cta" href={section.primaryCta.href}>
            {section.primaryCta.label}
          </Button>
        ) : null}
      </div>
    </PageSection>
  );
}
