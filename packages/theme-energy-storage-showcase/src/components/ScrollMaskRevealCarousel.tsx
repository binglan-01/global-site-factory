import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Heading, Text } from "@factory/ui";
import type { FeatureListSection } from "@factory/theme-enterprise";

export type ScrollMaskRevealCarouselProps = {
  section: FeatureListSection;
};

const AUTOPLAY_MS_DEFAULT = 4200;
/** objectBoundingBox hole side length at progress 0 — larger on narrow viewports (see applyHole). */
const HOLE_S_MIN_DESKTOP = 0.2;
const HOLE_S_MIN_MOBILE = 0.3;
const HOLE_S_MAX = 2.35;
const ROUND_RATIO = 0.15;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function ScrollMaskRevealCarousel({ section }: ScrollMaskRevealCarouselProps) {
  const items = section.items;
  const mid = useId().replace(/:/g, "");
  const maskId = `energy-storage-scroll-mask-${mid}`;
  const rootRef = useRef<HTMLElement | null>(null);
  const holeRef = useRef<SVGRectElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const rafScroll = useRef<number>(0);
  const scrollPending = useRef(false);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);

  useLayoutEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqNarrow = window.matchMedia("(max-width: 720px)");
    setReducedMotion(mqMotion.matches);
    setIsNarrow(mqNarrow.matches);
    const onMotion = (): void => setReducedMotion(mqMotion.matches);
    const onNarrow = (): void => setIsNarrow(mqNarrow.matches);
    mqMotion.addEventListener("change", onMotion);
    mqNarrow.addEventListener("change", onNarrow);
    return () => {
      mqMotion.removeEventListener("change", onMotion);
      mqNarrow.removeEventListener("change", onNarrow);
    };
  }, []);

  const applyHole = useCallback(
    (progress01: number) => {
      const hole = holeRef.current;
      const overlay = overlayRef.current;
      if (!hole || !overlay) {
        return;
      }

      if (reducedMotion) {
        hole.setAttribute("width", "0");
        hole.setAttribute("height", "0");
        hole.setAttribute("opacity", "0");
        overlay.style.opacity = "0";
        overlay.style.mask = "none";
        overlay.style.webkitMask = "none";
        return;
      }

      const p = clamp(progress01, 0, 1);
      const eased = easeOutCubic(p);
      const sMin = isNarrow ? HOLE_S_MIN_MOBILE : HOLE_S_MIN_DESKTOP;
      const s = sMin + (HOLE_S_MAX - sMin) * eased;
      const x = 0.5 - s / 2;
      const y = 0.5 - s / 2;
      const rx = String(s * ROUND_RATIO);

      hole.setAttribute("x", String(x));
      hole.setAttribute("y", String(y));
      hole.setAttribute("width", String(s));
      hole.setAttribute("height", String(s));
      hole.setAttribute("rx", rx);
      hole.setAttribute("ry", rx);
      hole.setAttribute("opacity", "1");

      const fadeStart = 0.88;
      const overlayOpacity = p >= fadeStart ? 1 - (p - fadeStart) / (1 - fadeStart) : 1;
      overlay.style.opacity = String(clamp(overlayOpacity, 0, 1));
      const url = `url(#${maskId})`;
      overlay.style.mask = url;
      overlay.style.webkitMask = url;
    },
    [isNarrow, maskId, reducedMotion],
  );

  const measureProgress = useCallback((): void => {
    const root = rootRef.current;
    if (!root || reducedMotion) {
      applyHole(1);
      return;
    }
    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight;
    const range = Math.max(rect.height - vh, 1);
    const raw = -rect.top / range;
    const p = clamp(raw, 0, 1);
    applyHole(p);
  }, [applyHole, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      applyHole(1);
      return;
    }

    const schedule = (): void => {
      if (scrollPending.current) {
        return;
      }
      scrollPending.current = true;
      rafScroll.current = window.requestAnimationFrame(() => {
        scrollPending.current = false;
        measureProgress();
      });
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    measureProgress();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.cancelAnimationFrame(rafScroll.current);
    };
  }, [measureProgress, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || items.length <= 1) {
      return;
    }
    const id = window.setInterval(() => {
      setCarouselIndex((i) => (i + 1) % items.length);
    }, AUTOPLAY_MS_DEFAULT);
    return () => window.clearInterval(id);
  }, [items.length, reducedMotion]);

  const active = items[carouselIndex] ?? items[0];
  const sectionMinHeightCss: CSSProperties =
    reducedMotion
      ? { minHeight: "min(140vh, 1200px)" }
      : { minHeight: "clamp(210vh, 240vh, 280vh)" };

  const gotoSlide = useCallback((i: number): void => {
    if (items.length === 0) {
      return;
    }
    setCarouselIndex(((i % items.length) + items.length) % items.length);
  }, [items.length]);

  return (
    <section
      ref={rootRef}
      aria-labelledby={`energy-storage-scroll-mask-h-${mid}`}
      className={[
        "factory-section",
        "energy-storage-scroll-mask",
        reducedMotion ? "energy-storage-scroll-mask--reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={sectionMinHeightCss}
    >
      <svg aria-hidden className="energy-storage-scroll-mask__defs" height="0" width="0">
        <defs>
          <mask
            height="100%"
            id={maskId}
            maskUnits="objectBoundingBox"
            width="100%"
            x="0"
            y="0"
          >
            <rect fill="white" height="1" width="1" x="0" y="0" />
            {/* Black hole reveals carousel beneath the white overlay; rounded rect + rotate(45) = rounded diamond */}
            <rect
              fill="black"
              height={HOLE_S_MAX}
              ref={holeRef}
              rx={HOLE_S_MAX * ROUND_RATIO}
              ry={HOLE_S_MAX * ROUND_RATIO}
              transform={`rotate(45 0.5 0.5)`}
              width={HOLE_S_MAX}
              x={0.5 - HOLE_S_MAX / 2}
              y={0.5 - HOLE_S_MAX / 2}
            />
          </mask>
        </defs>
      </svg>

      <div className="energy-storage-scroll-mask__sticky">
        <div aria-hidden className="energy-storage-scroll-mask__media">
          {items.map((item, i) =>
            item.image ? (
              <img
                alt=""
                className={[
                  "energy-storage-scroll-mask__slide",
                  i === carouselIndex ? "energy-storage-scroll-mask__slide--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                decoding={i === carouselIndex ? "sync" : "async"}
                draggable={false}
                key={`${item.image}-${i}`}
                loading={i === 0 ? "eager" : "lazy"}
                src={item.image}
              />
            ) : null,
          )}
        </div>

        <div aria-hidden className="energy-storage-scroll-mask__overlay" ref={overlayRef} />

        <div className="energy-storage-scroll-mask__content">
          <div className="energy-storage-scroll-mask__intro">
            <h2 className="energy-storage-scroll-mask__title" id={`energy-storage-scroll-mask-h-${mid}`}>
              {section.title}
            </h2>
            {section.description ? <Text className="energy-storage-scroll-mask__desc">{section.description}</Text> : null}
          </div>

          {active ? (
            <article className="energy-storage-scroll-mask__caption">
              {active.href ? (
                <a className="energy-storage-scroll-mask__caption-link" href={active.href}>
                  <Heading className="energy-storage-scroll-mask__caption-title" level={3}>
                    {active.title}
                  </Heading>
                  <Text className="energy-storage-scroll-mask__caption-desc">{active.description}</Text>
                </a>
              ) : (
                <>
                  <Heading className="energy-storage-scroll-mask__caption-title" level={3}>
                    {active.title}
                  </Heading>
                  <Text className="energy-storage-scroll-mask__caption-desc">{active.description}</Text>
                </>
              )}
            </article>
          ) : null}

          {items.length > 1 ? (
            <div aria-label="Application slides" className="energy-storage-scroll-mask__dots" role="tablist">
              {items.map((_, i) => (
                <button
                  aria-label={`Slide ${i + 1}`}
                  aria-selected={i === carouselIndex}
                  className={[
                    "energy-storage-scroll-mask__dot",
                    i === carouselIndex ? "energy-storage-scroll-mask__dot--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={`dot-${i}-${mid}`}
                  role="tab"
                  type="button"
                  onClick={() => gotoSlide(i)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
