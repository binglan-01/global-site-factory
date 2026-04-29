import { useCallback, useEffect, useState } from "react";
import type { Section } from "@factory/validators";
import { Button, Container, Heading, Text } from "@factory/ui";

export type HeroSplitCarouselSection = Extract<Section, { type: "hero" }>;

export type HeroSplitCarouselProps = {
  section: HeroSplitCarouselSection;
};

const DEFAULT_INTERVAL_MS = 4500;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function HeroSplitCarousel({ section }: HeroSplitCarouselProps) {
  const carousel = section.carousel;
  const images = carousel?.images ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [brokenSrcs, setBrokenSrcs] = useState<Set<number>>(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);

  const autoplay = carousel?.autoplay !== false;
  const intervalMs = carousel?.intervalMs ?? DEFAULT_INTERVAL_MS;
  const usePerspective = carousel?.perspective !== false;
  const useLightbox = carousel?.lightbox !== false;

  const len = images.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const fn = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    if (!autoplay || lightboxOpen || len <= 1 || reducedMotion) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => mod(i + 1, len));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoplay, lightboxOpen, len, intervalMs, reducedMotion]);

  const go = useCallback(
    (delta: number) => {
      if (len <= 0) return;
      setActiveIndex((i) => mod(i + delta, len));
    },
    [len],
  );

  const openLightbox = useCallback(
    (index: number) => {
      if (!useLightbox || len <= 0) return;
      setLightboxIndex(mod(index, len));
      setLightboxOpen(true);
    },
    [len, useLightbox],
  );

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const lightboxGo = useCallback(
    (delta: number) => {
      if (len <= 0) return;
      setLightboxIndex((i) => mod(i + delta, len));
    },
    [len],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        lightboxGo(-1);
      } else if (e.key === "ArrowRight") {
        lightboxGo(1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxOpen, closeLightbox, lightboxGo]);

  const onImgError = useCallback((index: number) => {
    setBrokenSrcs((prev) => new Set(prev).add(index));
  }, []);

  if (len === 0) {
    return null;
  }

  const safeLen = len;
  const prevIndex = mod(activeIndex - 1, safeLen);
  const nextIndex = mod(activeIndex + 1, safeLen);
  const showArrows = len > 1;
  const showDots = len > 1;
  const slideCount = len;

  const slideClassFor = (i: number): string => {
    if (!usePerspective || slideCount <= 1) {
      return i === activeIndex
        ? "tps-hero-carousel__slide tps-hero-carousel__slide--active"
        : "tps-hero-carousel__slide tps-hero-carousel__slide--inactive";
    }
    if (i === activeIndex) return "tps-hero-carousel__slide tps-hero-carousel__slide--active";
    if (i === prevIndex) return "tps-hero-carousel__slide tps-hero-carousel__slide--prev";
    if (i === nextIndex) return "tps-hero-carousel__slide tps-hero-carousel__slide--next";
    return "tps-hero-carousel__slide tps-hero-carousel__slide--hidden";
  };

  const lightboxItem = images[lightboxIndex];
  const lightboxBroken = brokenSrcs.has(lightboxIndex);

  return (
    <section aria-label={section.title} className="tps-hero tps-hero--split-carousel">
      <Container className="tps-hero__split-inner">
        <div className="tps-hero__copy">
          {section.eyebrow ? <p className="tps-hero__eyebrow">{section.eyebrow}</p> : null}
          <Heading className="tps-hero__title tps-hero__title--split" level={1}>
            {section.title}
          </Heading>
          <Text className="tps-hero__description">{section.description}</Text>
          {section.primaryCta ? (
            <Button className="tps-hero__cta" href={section.primaryCta.href}>
              {section.primaryCta.label}
            </Button>
          ) : null}
        </div>
        <div className="tps-hero__media">
          <div
            className={[
              "tps-hero-carousel",
              reducedMotion ? "tps-hero-carousel--reduced-motion" : null,
              showArrows ? null : "tps-hero-carousel--no-arrows",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {showArrows ? (
              <button
                aria-label="Previous slide"
                className="tps-hero-carousel__arrow tps-hero-carousel__arrow--prev"
                type="button"
                onClick={() => go(-1)}
              />
            ) : null}
            <div className="tps-hero-carousel__stage" role="region" aria-live={reducedMotion ? "off" : "polite"}>
              {images.map((img, i) => {
                const broken = brokenSrcs.has(i);
                return (
                  <div className={slideClassFor(i)} key={`${img.src}-${i}`}>
                    {broken ? (
                      <div className="tps-hero-carousel__placeholder" />
                    ) : (
                      <button
                        className="tps-hero-carousel__img-button"
                        type="button"
                        aria-label={img.alt ?? img.title ?? `Slide ${i + 1}`}
                        onClick={() => (i === activeIndex ? openLightbox(i) : setActiveIndex(i))}
                      >
                        <img
                          alt={img.alt ?? ""}
                          className="tps-hero-carousel__img"
                          decoding="async"
                          loading={i === activeIndex ? "eager" : "lazy"}
                          src={img.src}
                          onError={() => onImgError(i)}
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {showArrows ? (
              <button
                aria-label="Next slide"
                className="tps-hero-carousel__arrow tps-hero-carousel__arrow--next"
                type="button"
                onClick={() => go(1)}
              />
            ) : null}
            {showDots ? (
              <div className="tps-hero-carousel__dots" role="tablist" aria-label="Slides">
                {images.map((_, i) => (
                  <button
                    aria-label={`Go to slide ${i + 1}`}
                    aria-selected={i === activeIndex}
                    className={
                      i === activeIndex
                        ? "tps-hero-carousel__dot tps-hero-carousel__dot--active"
                        : "tps-hero-carousel__dot"
                    }
                    key={i}
                    role="tab"
                    type="button"
                    onClick={() => setActiveIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {lightboxOpen && useLightbox && lightboxItem && !lightboxBroken ? (
        <div
          className="tps-hero-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title ?? "Image preview"}
          onClick={closeLightbox}
        >
          <button
            aria-label="Close preview"
            className="tps-hero-lightbox__close"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          />
          <div className="tps-hero-lightbox__inner" onClick={(e) => e.stopPropagation()}>
            {len > 1 ? (
              <button
                aria-label="Previous image"
                className="tps-hero-lightbox__arrow tps-hero-lightbox__arrow--prev"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxGo(-1);
                }}
              />
            ) : null}
            <img
              alt={lightboxItem.alt ?? ""}
              className="tps-hero-lightbox__img"
              decoding="async"
              src={lightboxItem.src}
            />
            {len > 1 ? (
              <button
                aria-label="Next image"
                className="tps-hero-lightbox__arrow tps-hero-lightbox__arrow--next"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxGo(1);
                }}
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
