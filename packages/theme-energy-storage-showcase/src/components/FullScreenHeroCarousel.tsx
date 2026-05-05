import { useCallback, useEffect, useState } from "react";
import { Button } from "@factory/ui";
import type { Section } from "@factory/validators";

export type HeroSection = Extract<Section, { type: "hero" }>;

export type FullScreenHeroCarouselProps = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: HeroSection["primaryCta"];
  carousel: NonNullable<HeroSection["carousel"]>;
};

export function FullScreenHeroCarousel({
  carousel,
  eyebrow,
  primaryCta,
  subtitle,
  title,
}: FullScreenHeroCarouselProps) {
  const images = carousel.images;
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    function onChange(): void {
      setReducedMotion(mq.matches);
    }

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const autoplay = carousel.autoplay !== false && images.length > 1;
    if (!autoplay || reducedMotion) {
      return;
    }
    const ms = carousel.intervalMs ?? 6200;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [carousel.autoplay, carousel.intervalMs, images.length, reducedMotion]);

  const goto = useCallback(
    (next: number) => {
      if (images.length === 0) {
        return;
      }
      setIndex((next + images.length) % images.length);
    },
    [images.length],
  );

  const next = useCallback(() => {
    goto(index + 1);
  }, [goto, index]);

  const prev = useCallback(() => {
    goto(index - 1);
  }, [goto, index]);

  if (images.length === 0) {
    return null;
  }

  const active = images[index]!;
  const src = active.src;
  const alt = active.alt ?? active.title ?? title;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={title}
      className="energy-storage-full-hero"
    >
      {images.map((img, slideIndex) => (
        <div
          aria-hidden={slideIndex !== index}
          className={[
            "energy-storage-full-hero__slide",
            slideIndex === index ? "energy-storage-full-hero__slide--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          key={`${img.src}-${slideIndex}`}
          role="presentation"
          style={{
            backgroundImage: `url(${JSON.stringify(img.src)})`,
          }}
        />
      ))}
      <div className="energy-storage-full-hero__scrim" />
      <div className="energy-storage-full-hero__inner">
        {eyebrow ? <p className="energy-storage-full-hero__eyebrow">{eyebrow}</p> : null}
        <h1 className="energy-storage-full-hero__title">{title}</h1>
        <p className="energy-storage-full-hero__subtitle">{subtitle}</p>
        {primaryCta ? (
          <Button className="energy-storage-full-hero__cta" href={primaryCta.href}>
            {primaryCta.label}
          </Button>
        ) : null}
        {images.length > 1 ? (
          <>
            <div className="energy-storage-full-hero__toolbar" aria-label="Carousel controls">
              <button
                aria-label="Previous slide"
                className="energy-storage-full-hero__nav-btn"
                type="button"
                onClick={prev}
              >
                ◀
              </button>
              <div className="energy-storage-full-hero__dots" role="tablist">
                {images.map((_img, dotIndex) => (
                  <button
                    aria-label={`Slide ${dotIndex + 1}`}
                    aria-current={dotIndex === index ? "true" : undefined}
                    className={[
                      "energy-storage-full-hero__dot",
                      dotIndex === index ? "energy-storage-full-hero__dot--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={`dot-${dotIndex}`}
                    type="button"
                    onClick={() => goto(dotIndex)}
                  />
                ))}
              </div>
              <button
                aria-label="Next slide"
                className="energy-storage-full-hero__nav-btn"
                type="button"
                onClick={next}
              >
                ▶
              </button>
            </div>
            <span className="energy-storage-visually-hidden" role="img" aria-live="polite">
              {alt}
            </span>
          </>
        ) : null}
      </div>
    </section>
  );
}
