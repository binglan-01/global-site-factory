import { Container, Heading, Section as PageSection } from "@factory/ui";
import type { GalleryProps as ThemeGalleryProps } from "@factory/theme-enterprise";

export type GallerySection = ThemeGalleryProps["section"];
export type GalleryProps = ThemeGalleryProps;

export function Gallery({ section }: GalleryProps) {
  const imgs = section.images ?? [];
  const cols = section.columns ?? 3;

  return (
    <PageSection className="energy-storage-gallery">
      <Container className="energy-storage-gallery__shell">
        <Heading className="energy-storage-gallery__title" level={2}>
          {section.title}
        </Heading>
        <div
          className="energy-storage-gallery__grid energy-storage-gallery__grid--accent"
          data-columns={`${cols}`}
        >
          {imgs.map((src, ix) => (
            <figure className="energy-storage-gallery-card" key={`${src}-${ix}`}>
              <div aria-hidden className="energy-storage-gallery-card__ratio" />
              <div
                className="energy-storage-gallery-card__media"
                style={{ backgroundImage: `url(${JSON.stringify(src)})` }}
              />
            </figure>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}
