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

/** viewBox is 0..100 × 0..100; hole half-side (before 45° rotation) */
const VB_HOLE_SIDE_MIN_MOBILE = 34;
const VB_HOLE_SIDE_MIN_DESKTOP = 28;
/** Must exceed √(50²+50²) × 2 so subtracted union covers viewport in vb space */
const VB_HOLE_SIDE_MAX = 175;
const ROUND_CORNER_FR = 0.18;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(Math.max(n, lo), hi);
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/** Axis-aligned rounded square boundary (CCW), centered at origin, side length = 2*half. */
function buildRoundedSquareOutline(half: number, stepsPerArc = 6): Array<[number, number]> {
  const h = half;
  const r0 = Math.min(h * ROUND_CORNER_FR, h * 0.45);
  const pts: Array<[number, number]> = [];

  const arc = (cx: number, cy: number, a0: number, a1: number): void => {
    for (let i = 1; i <= stepsPerArc; i++) {
      const t = i / stepsPerArc;
      const a = a0 + (a1 - a0) * t;
      pts.push([cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)]);
    }
  };

  pts.push([-h + r0, -h]);
  pts.push([h - r0, -h]);
  arc(h - r0, -h + r0, -Math.PI / 2, 0);
  pts.push([h, h - r0]);
  arc(h - r0, h - r0, 0, Math.PI / 2);
  pts.push([-h + r0, h]);
  arc(-h + r0, h - r0, Math.PI / 2, Math.PI);
  pts.push([-h, -h + r0]);
  arc(-h + r0, -h + r0, Math.PI, (3 * Math.PI) / 2);

  return pts;
}

/** White frame + transparent rounded-diamond hole via single path, fill-rule evenodd. */
function buildCurtainPathD(progress01: number, narrow: boolean): string {
  const p = clamp(progress01, 0, 1);
  const eased = easeOutCubic(p);
  const vmin = narrow ? VB_HOLE_SIDE_MIN_MOBILE : VB_HOLE_SIDE_MIN_DESKTOP;
  const vmax = VB_HOLE_SIDE_MAX;
  const side = vmin + (vmax - vmin) * eased;
  const half = side / 2;

  const vbCx = 50;
  const vbCy = 50;
  const rot = Math.PI / 4;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  const world = ([lx, ly]: readonly [number, number]): [number, number] => [
    lx * cos - ly * sin + vbCx,
    lx * sin + ly * cos + vbCy,
  ];

  const outer = `M 0 0 H 100 V 100 H 0 Z`;

  let outline = buildRoundedSquareOutline(half);
  outline = outline.filter((pt, i, a) => i === 0 || pt[0] !== a[i - 1]![0] || pt[1] !== a[i - 1]![1]);
  const inner = outline.map(world);
  if (inner.length < 3) {
    return outer;
  }

  let d = `${outer} M ${inner[0]![0]} ${inner[0]![1]}`;
  for (let i = 1; i < inner.length; i++) {
    const [x, y] = inner[i]!;
    d += ` L ${x} ${y}`;
  }
  d += " Z";

  return d;
}

export function ScrollMaskRevealCarousel({ section }: ScrollMaskRevealCarouselProps) {
  const items = section.items;
  const mid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLElement | null>(null);
  const curtainPathRef = useRef<SVGPathElement | null>(null);
  const curtainSvgRef = useRef<SVGSVGElement | null>(null);
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

  const applyProgress = useCallback(
    (progress01: number) => {
      const pathEl = curtainPathRef.current;
      const svgEl = curtainSvgRef.current;
      const rootEl = rootRef.current;
      if (!pathEl || !svgEl || !rootEl) {
        return;
      }

      if (reducedMotion) {
        pathEl.setAttribute("fill", "transparent");
        pathEl.setAttribute("d", "");
        svgEl.style.opacity = "0";
        rootEl.dataset.ssScrollProgress = "reduced";
        return;
      }

      const pUsed = clamp(progress01, 0, 1);
      const d = buildCurtainPathD(pUsed, isNarrow);
      pathEl.setAttribute("d", d);
      pathEl.setAttribute("fill", "#ffffff");
      pathEl.setAttribute("fillRule", "evenodd");
      svgEl.style.opacity = "1";
      rootEl.dataset.ssScrollProgress = pUsed.toFixed(4);
    },
    [isNarrow, reducedMotion],
  );

  const measureProgress = useCallback((): void => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    if (reducedMotion) {
      applyProgress(1);
      return;
    }

    const rect = root.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = Math.max(rect.height - vh, 1);

    /*
     * sticky 顶刚贴住视口顶时 rect.top≈0 → progress≈0
     * section 末尾接近离开：rect.top ≈ -(rect.height - vh) → progress≈1
     */
    const raw = -rect.top / scrollable;
    applyProgress(clamp(raw, 0, 1));
  }, [applyProgress, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      applyProgress(1);
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
    queueMicrotask(schedule);

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
  const sectionMinHeightCss: CSSProperties = reducedMotion
    ? { minHeight: "min(140vh, 1200px)" }
    : { minHeight: "clamp(220vh, 245vh, 260vh)" };

  const gotoSlide = useCallback(
    (i: number): void => {
      if (items.length === 0) {
        return;
      }
      setCarouselIndex(((i % items.length) + items.length) % items.length);
    },
    [items.length],
  );

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

        <svg
          aria-hidden
          className="energy-storage-scroll-mask__curtain"
          preserveAspectRatio="none"
          ref={curtainSvgRef}
          viewBox="0 0 100 100"
        >
          <path
            className="energy-storage-scroll-mask__curtain-path"
            d={buildCurtainPathD(0, false)}
            fill="#ffffff"
            fillRule="evenodd"
            ref={curtainPathRef}
          />
        </svg>

        <div className="energy-storage-scroll-mask__content">
          <div className="energy-storage-scroll-mask__intro">
            <h2 className="energy-storage-scroll-mask__title" id={`energy-storage-scroll-mask-h-${mid}`}>
              {section.title}
            </h2>
            {section.description ? (
              <Text className="energy-storage-scroll-mask__desc">{section.description}</Text>
            ) : null}
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
