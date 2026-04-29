import { useState } from "react";
import type { Section } from "@factory/validators";
import { Container, Grid, Heading, Section as PageSection, Text } from "@factory/ui";

export type GallerySection = Extract<Section, { type: "gallery" }>;

export type GalleryProps = {
  section: GallerySection;
};

function EnterpriseGalleryImage({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div
        className="enterprise-gallery__image enterprise-gallery__image--fallback"
        role="img"
        aria-hidden
      />
    );
  }
  return (
    <img
      alt=""
      className="factory-image-block enterprise-gallery__image"
      decoding="async"
      loading="lazy"
      src={src}
      onError={() => setBroken(true)}
    />
  );
}

export function Gallery({ section }: GalleryProps) {
  const images = section.images ?? [];
  const columns = section.columns ?? 3;
  let colMod = "";
  if (columns === 2) {
    colMod = "enterprise-gallery__grid--cols-2";
  } else if (columns === 4) {
    colMod = "enterprise-gallery__grid--cols-4";
  }

  if (images.length === 0) {
    return (
      <PageSection className="enterprise-gallery">
        <Container className="enterprise-gallery__container">
          <Heading className="enterprise-gallery__title">{section.title}</Heading>
          <Text className="enterprise-gallery__empty">Images will be added soon.</Text>
        </Container>
      </PageSection>
    );
  }

  return (
    <PageSection className="enterprise-gallery">
      <Container className="enterprise-gallery__container">
        <Heading className="enterprise-gallery__title">{section.title}</Heading>
        <Grid
          className={["enterprise-gallery__grid", colMod].filter(Boolean).join(" ")}
          columns={columns}
        >
          {images.map((image, index) => (
            <EnterpriseGalleryImage key={`${image}-${String(index)}`} src={image} />
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
