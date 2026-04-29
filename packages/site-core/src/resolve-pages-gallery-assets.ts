import type { PageContent, Section } from "@factory/validators";
import { listGalleryImagePublicPaths } from "./list-gallery-images-in-asset-dir";

async function resolveGallerySection(siteSlug: string, section: Section): Promise<Section> {
  if (section.type !== "gallery") {
    return section;
  }

  let resolvedImages: string[] = [];
  if (section.assetDir !== undefined && section.assetDir.length > 0) {
    resolvedImages = await listGalleryImagePublicPaths(siteSlug, section.assetDir);
  }
  if (resolvedImages.length === 0 && section.images !== undefined && section.images.length > 0) {
    resolvedImages = [...section.images];
  }

  return { ...section, images: resolvedImages };
}

async function resolvePageContent(siteSlug: string, page: PageContent): Promise<PageContent> {
  const sections = await Promise.all(page.sections.map((s) => resolveGallerySection(siteSlug, s)));
  return { ...page, sections };
}

export async function resolvePagesGalleryAssetDirs(
  siteSlug: string,
  pages: PageContent[],
): Promise<PageContent[]> {
  return Promise.all(pages.map((page) => resolvePageContent(siteSlug, page)));
}
