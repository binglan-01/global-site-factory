import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PageSchema, type PageContent } from "@factory/validators";
import { getSitePagesDir } from "./paths";

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function loadPages(siteSlug: string, locale: string): Promise<PageContent[]> {
  const pagesDir = getSitePagesDir(siteSlug, locale);

  try {
    await access(pagesDir);
  } catch {
    throw new Error(
      `Pages directory not found for siteSlug "${siteSlug}" and locale "${locale}" at ${pagesDir}.`,
    );
  }

  let pageFileNames: string[];

  try {
    const entries = await readdir(pagesDir, { withFileTypes: true });
    pageFileNames = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));
  } catch (error) {
    throw new Error(
      `Failed to read pages directory for siteSlug "${siteSlug}" and locale "${locale}" at ${pagesDir}: ${formatUnknownError(
        error,
      )}`,
    );
  }

  const pages = await Promise.all(
    pageFileNames.map(async (fileName) => {
      const pagePath = join(pagesDir, fileName);

      try {
        const fileContent = await readFile(pagePath, "utf8");
        const rawPage: unknown = JSON.parse(fileContent) as unknown;
        return PageSchema.parse(rawPage);
      } catch (error) {
        throw new Error(
          `Failed to load page for siteSlug "${siteSlug}" and locale "${locale}" at ${pagePath}: ${formatUnknownError(
            error,
          )}`,
        );
      }
    }),
  );

  if (!pages.some((page) => page.slug === "/")) {
    throw new Error(`Missing homepage "/" for siteSlug "${siteSlug}" and locale "${locale}".`);
  }

  return pages;
}
