import { useEffect, useRef, useState } from "react";
import { Heading, Section as PageSection, Text } from "@factory/ui";

export type ScrollRevealShowcaseItem = {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  imageAlt?: string;
};

export type ScrollRevealShowcaseProps = {
  sectionTitle: string;
  sectionDescription?: string | undefined;
  items: ScrollRevealShowcaseItem[];
};

export function ScrollRevealShowcase({
  items,
  sectionDescription,
  sectionTitle,
}: ScrollRevealShowcaseProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const [visibleMask, setVisibleMask] = useState((): Set<number> => new Set());

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      const all = new Set(items.map((_item, i) => i));
      setVisibleMask(all);
      return;
    }

    const seen = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          const ix = Number((entry.target as HTMLElement).dataset.revealIx);
          if (!Number.isNaN(ix)) {
            seen.add(ix);
            setVisibleMask(new Set(seen));
          }
        });
      },
      { root: null, rootMargin: "0px 0px -15% 0px", threshold: 0.2 },
    );

    node.querySelectorAll<HTMLElement>("[data-reveal-ix]").forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  const [carouselIndex, setCarouselIndex] = useState(0);

  const shiftCarousel = (delta: number): void => {
    if (items.length === 0) {
      return;
    }
    setCarouselIndex((prev) => (prev + delta + items.length) % items.length);
  };

  const mobileActive =
    typeof carouselIndex === "number" && items.length > 0 ? items[carouselIndex]! : items[0];

  return (
    <PageSection className="energy-storage-reveal-showcase">
      <div className="energy-storage-reveal-showcase__head">
        <Heading className="energy-storage-reveal-showcase__title" level={2}>
          {sectionTitle}
        </Heading>
        {sectionDescription ? <Text className="energy-storage-reveal-showcase__desc">{sectionDescription}</Text> : null}
      </div>
      <section ref={rootRef}>
        <div aria-hidden className="energy-storage-reveal-showcase__grid energy-storage-reveal-showcase__grid--desktop">
          {items.map((item, ix) => (
            <article
              className={[
                "energy-storage-reveal-showcase__card",
                visibleMask.has(ix) ? "energy-storage-reveal-showcase__card--visible" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              data-reveal-ix={ix}
              key={`desk-${item.title}-${ix}`}
            >
              {item.icon ? (
                <div aria-hidden className="energy-storage-reveal-showcase__icon">
                  {item.icon}
                </div>
              ) : null}
              {item.image ? (
                <div
                  aria-hidden="true"
                  className="energy-storage-reveal-showcase__media energy-storage-reveal-showcase__media--cover"
                  style={{ backgroundImage: `url(${JSON.stringify(item.image)})` }}
                  role="img"
                />
              ) : (
                <div aria-hidden className="energy-storage-reveal-showcase__placeholder" />
              )}
              <div className="energy-storage-reveal-showcase__body">
                <Heading className="energy-storage-reveal-showcase__card-title" level={3}>
                  {item.title}
                </Heading>
                <Text>{item.description}</Text>
              </div>
            </article>
          ))}
        </div>
        <div className="energy-storage-reveal-showcase__carousel energy-storage-reveal-showcase__carousel--mobile">
          {mobileActive ? (
            <article className="energy-storage-reveal-showcase__carousel-card energy-storage-reveal-showcase__card--visible">
              {mobileActive.image ? (
                <div
                  aria-hidden="true"
                  className="energy-storage-reveal-showcase__carousel-media energy-storage-reveal-showcase__media--cover"
                  style={{ backgroundImage: `url(${JSON.stringify(mobileActive.image)})` }}
                  role="img"
                />
              ) : (
                <div
                  aria-hidden
                  className="energy-storage-reveal-showcase__placeholder energy-storage-reveal-showcase__placeholder--wide"
                />
              )}
              <div className="energy-storage-reveal-showcase__body">
                <Heading className="energy-storage-reveal-showcase__card-title" level={3}>
                  {mobileActive.title}
                </Heading>
                <Text>{mobileActive.description}</Text>
              </div>
            </article>
          ) : null}
          {items.length > 1 ? (
            <div className="energy-storage-reveal-showcase__carousel-bar">
              <button
                aria-label="Previous scenario"
                className="energy-storage-reveal-showcase__chev"
                type="button"
                onClick={() => shiftCarousel(-1)}
              >
                ◀
              </button>
              <button
                aria-label="Next scenario"
                className="energy-storage-reveal-showcase__chev"
                type="button"
                onClick={() => shiftCarousel(1)}
              >
                ▶
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </PageSection>
  );
}
