import { useCallback, useEffect, useState } from "react";
import type { Section } from "@factory/validators";
import { Container, Grid, Heading, Section as PageSection, Text } from "@factory/ui";

export type GallerySection = Extract<Section, { type: "gallery" }>;

export type GalleryProps = {
  section: GallerySection;
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

type GalleryThumbnailProps = {
  aspectClass: string;
  imageSrc: string;
  index: number;
  total: number;
  isProductGrid: boolean;
  lightboxEnabled: boolean;
  onOpen: (index: number) => void;
};

function GalleryThumbnail({
  aspectClass,
  imageSrc,
  index,
  total,
  isProductGrid,
  lightboxEnabled,
  onOpen,
}: GalleryThumbnailProps) {
  const [broken, setBroken] = useState(false);
  const imageClasses = ["factory-image-block", "tps-gallery__image", aspectClass].filter(Boolean).join(" ");

  const fallback = (
    <div
      className={["tps-gallery__image-fallback", aspectClass].filter(Boolean).join(" ")}
      role="img"
      aria-hidden
    />
  );

  const imgNode = broken ? (
    fallback
  ) : (
    <img
      alt=""
      className={imageClasses}
      decoding="async"
      loading="lazy"
      onError={() => setBroken(true)}
      src={imageSrc}
    />
  );

  const core =
    lightboxEnabled ? (
      <button
        aria-label={`Open image ${String(index + 1)} of ${String(total)}`}
        className="tps-gallery__trigger"
        type="button"
        onClick={() => {
          onOpen(index);
        }}
      >
        {imgNode}
      </button>
    ) : (
      imgNode
    );

  if (isProductGrid) {
    return <div className="tps-gallery__cell">{core}</div>;
  }

  return core;
}

function resolveAspectClass(section: GallerySection): string {
  if (section.imageAspect === "square") {
    return "tps-gallery__image--square";
  }
  if (section.imageAspect === "landscape") {
    return "tps-gallery__image--landscape";
  }
  if (section.imageAspect === "portrait") {
    return "tps-gallery__image--portrait";
  }
  return "";
}

export function Gallery({ section }: GalleryProps) {
  const images = section.images ?? [];
  const lightboxEnabled = section.lightbox === true;
  const zoomEnabled = section.zoom === true;
  const isProductGrid = section.layout === "product-grid";
  const columns = section.columns ?? 3;
  const aspectClass = resolveAspectClass(section);
  const gridClassName = isProductGrid
    ? "tps-gallery__grid tps-gallery__grid--product-grid"
    : "tps-gallery__grid";

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);

  const total = images.length;
  const safeIndex = total > 0 ? Math.min(Math.max(0, activeIndex), total - 1) : 0;
  const activeSrc = total > 0 ? images[safeIndex] : "";

  const close = useCallback(() => {
    setIsOpen(false);
    setZoomScale(ZOOM_MIN);
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (total < 1) {
        return;
      }
      setActiveIndex((i) => (i + delta + total) % total);
      setZoomScale(ZOOM_MIN);
    },
    [total],
  );

  const openAt = useCallback((index: number) => {
    setActiveIndex(index);
    setZoomScale(ZOOM_MIN);
    setIsOpen(true);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomScale((s) => Math.min(ZOOM_MAX, s + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomScale((s) => Math.max(ZOOM_MIN, s - ZOOM_STEP));
  }, []);

  const zoomReset = useCallback(() => {
    setZoomScale(ZOOM_MIN);
  }, []);

  useEffect(() => {
    if (!lightboxEnabled) {
      return;
    }
    setZoomScale(ZOOM_MIN);
  }, [safeIndex, lightboxEnabled]);

  useEffect(() => {
    if (!lightboxEnabled || !isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxEnabled, isOpen, close, go]);

  useEffect(() => {
    if (!lightboxEnabled || !isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxEnabled, isOpen]);

  if (images.length === 0) {
    return (
      <PageSection className="tps-gallery">
        <Container className="tps-gallery__container">
          <Heading className="tps-gallery__title">{section.title}</Heading>
          <Text className="tps-gallery__empty">Images will be added soon.</Text>
        </Container>
      </PageSection>
    );
  }

  return (
    <PageSection className="tps-gallery">
      <Container className="tps-gallery__container">
        <Heading className="tps-gallery__title">{section.title}</Heading>
        <Grid className={gridClassName} columns={columns}>
          {images.map((imageSrc, index) => (
            <GalleryThumbnail
              key={`${imageSrc}-${String(index)}`}
              aspectClass={aspectClass}
              imageSrc={imageSrc}
              index={index}
              isProductGrid={isProductGrid}
              lightboxEnabled={lightboxEnabled}
              total={images.length}
              onOpen={openAt}
            />
          ))}
        </Grid>
      </Container>

      {lightboxEnabled && isOpen && total > 0 ? (
        <div
          aria-label={section.title}
          aria-modal="true"
          className="tps-gallery-lightbox"
          role="dialog"
        >
          <button
            aria-label="Close gallery preview"
            className="tps-gallery-lightbox__backdrop"
            type="button"
            onClick={close}
          />
          <div
            className="tps-gallery-lightbox__dialog"
            onClick={(event) => {
              event.stopPropagation();
            }}
            role="presentation"
          >
            <button
              aria-label="Close preview"
              className="tps-gallery-lightbox__close"
              type="button"
              onClick={close}
            />
            <p aria-live="polite" className="tps-gallery-lightbox__counter">
              {String(safeIndex + 1)} / {String(total)}
            </p>
            {zoomEnabled ? (
              <div className="tps-gallery-lightbox__zoom" role="group" aria-label="Zoom controls">
                <button
                  aria-label="Zoom out"
                  className="tps-gallery-lightbox__zoom-btn"
                  disabled={zoomScale <= ZOOM_MIN}
                  type="button"
                  onClick={zoomOut}
                >
                  −
                </button>
                <button aria-label="Reset zoom" className="tps-gallery-lightbox__zoom-btn" type="button" onClick={zoomReset}>
                  1:1
                </button>
                <button
                  aria-label="Zoom in"
                  className="tps-gallery-lightbox__zoom-btn"
                  disabled={zoomScale >= ZOOM_MAX}
                  type="button"
                  onClick={zoomIn}
                >
                  +
                </button>
              </div>
            ) : null}
            <div className="tps-gallery-lightbox__stage">
              {total > 1 ? (
                <button
                  aria-label="Previous image"
                  className="tps-gallery-lightbox__arrow tps-gallery-lightbox__arrow--prev"
                  type="button"
                  onClick={() => {
                    go(-1);
                  }}
                />
              ) : null}
              <div className="tps-gallery-lightbox__image-wrap">
                <img
                  alt=""
                  className="tps-gallery-lightbox__image"
                  decoding="async"
                  key={activeSrc}
                  src={activeSrc}
                  style={{ transform: `scale(${String(zoomScale)})` }}
                />
              </div>
              {total > 1 ? (
                <button
                  aria-label="Next image"
                  className="tps-gallery-lightbox__arrow tps-gallery-lightbox__arrow--next"
                  type="button"
                  onClick={() => {
                    go(1);
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </PageSection>
  );
}
