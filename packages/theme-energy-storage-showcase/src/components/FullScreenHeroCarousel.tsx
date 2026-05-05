import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
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

type HeroCarouselSlide = NonNullable<NonNullable<HeroSection["carousel"]>["images"]>[number];

function slideIsVideo(slide: HeroCarouselSlide): boolean {
  return slide.mediaType === "video" || Boolean(slide.video);
}

function slideImageUrl(slide: HeroCarouselSlide): string | undefined {
  return slide.image ?? slide.src;
}

function posterOrImageForVideoSlide(slide: HeroCarouselSlide): string | undefined {
  return slide.poster ?? slideImageUrl(slide);
}

export function FullScreenHeroCarousel({
  carousel,
  eyebrow,
  primaryCta,
  subtitle,
  title,
}: FullScreenHeroCarouselProps) {
  const slides = carousel.images;
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  /** After load/decoding/network failure, swap to poster / image still (no decorative video element). */
  const [brokenVideoSlides, setBrokenVideoSlides] = useState(() => new Set<number>());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, slides.length);
  }, [slides.length]);

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
    const autoplay = carousel.autoplay !== false && slides.length > 1;
    if (!autoplay || reducedMotion) {
      return;
    }
    const ms = carousel.intervalMs ?? 6200;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [carousel.autoplay, carousel.intervalMs, reducedMotion, slides.length]);

  useEffect(() => {
    slides.forEach((slide, i) => {
      const el = videoRefs.current[i];
      if (!el || !slideIsVideo(slide) || reducedMotion || !slide.video || brokenVideoSlides.has(i)) {
        if (el) {
          el.pause();
        }
        return;
      }
      if (i === index) {
        void el.play().catch(() => {
          /* Autoplay policies or stalls — poster remains visible until decoding succeeds */
        });
      } else {
        el.pause();
      }
    });
  }, [brokenVideoSlides, index, reducedMotion, slides]);

  const goto = useCallback(
    (next: number) => {
      if (slides.length === 0) {
        return;
      }
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => {
    goto(index + 1);
  }, [goto, index]);

  const prev = useCallback(() => {
    goto(index - 1);
  }, [goto, index]);

  if (slides.length === 0) {
    return null;
  }

  const active = slides[index]!;
  const activeAlt = active.alt ?? active.title ?? title;

  function renderSlideMedia(slide: HeroCarouselSlide, slideIndex: number): ReactElement | null {
    const isVid = slideIsVideo(slide);
    const fallbackUrl = posterOrImageForVideoSlide(slide);
    const showVideoPlayback =
      Boolean(slide.video) && !reducedMotion && !brokenVideoSlides.has(slideIndex);

    if (isVid) {
      if (showVideoPlayback) {
        return (
          <video
            ref={(el) => {
              videoRefs.current[slideIndex] = el;
            }}
            aria-hidden
            muted
            autoPlay
            playsInline
            loop
            preload="metadata"
            poster={fallbackUrl}
            className="energy-storage-full-hero__slide-video"
            src={slide.video}
            onError={() => {
              setBrokenVideoSlides((prev) => new Set(prev).add(slideIndex));
            }}
          />
        );
      }
      /* Reduced motion, missing/unplayable mp4 URL, or no video path: poster / legacy image fills the slide */
      if (!fallbackUrl) {
        return null;
      }
      return (
        <div
          className="energy-storage-full-hero__slide-fill"
          key={`poster-${slideIndex}`}
          role="presentation"
          style={{
            backgroundImage: `url(${JSON.stringify(fallbackUrl)})`,
          }}
        />
      );
    }

    const url = slideImageUrl(slide);
    if (!url) {
      return null;
    }
    return (
      <div
        className="energy-storage-full-hero__slide-fill"
        key={`img-${slideIndex}`}
        role="presentation"
        style={{
          backgroundImage: `url(${JSON.stringify(url)})`,
        }}
      />
    );
  }

  const multiSlide = slides.length > 1;

  return (
    <section
      aria-roledescription={multiSlide ? "carousel" : undefined}
      aria-label={title}
      className="energy-storage-full-hero"
    >
      {slides.map((slide, slideIndex) => (
        <div
          aria-hidden={slideIndex !== index}
          className={[
            "energy-storage-full-hero__slide",
            slideIndex === index ? "energy-storage-full-hero__slide--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          key={`${slide.video ?? slide.poster ?? slide.src ?? slide.image ?? "slide"}-${slideIndex}`}
          role="presentation"
        >
          {renderSlideMedia(slide, slideIndex)}
        </div>
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
        {slides.length > 1 ? (
          <>
            <div aria-label="Carousel controls" className="energy-storage-full-hero__toolbar">
              <button
                aria-label="Previous slide"
                className="energy-storage-full-hero__nav-btn"
                type="button"
                onClick={prev}
              >
                ◀
              </button>
              <div className="energy-storage-full-hero__dots" role="tablist">
                {slides.map((_slide, dotIndex) => (
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
            <span className="energy-storage-visually-hidden" aria-live="polite" role="img">
              {activeAlt}
            </span>
          </>
        ) : null}
      </div>
    </section>
  );
}
