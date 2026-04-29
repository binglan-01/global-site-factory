import { access } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { SiteConfigSchema, type SiteConfig } from "@factory/validators";
import { getSiteConfigPath } from "./paths";

type SiteConfigModule = {
  default?: unknown;
  siteConfig?: unknown;
  config?: unknown;
};

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function loadSiteConfig(siteSlug: string): Promise<SiteConfig> {
  const configPath = getSiteConfigPath(siteSlug);

  try {
    await access(configPath);
  } catch {
    throw new Error(`Site config not found for siteSlug "${siteSlug}" at ${configPath}.`);
  }

  try {
    const configUrl = pathToFileURL(configPath).href;
    const configModule = (await import(configUrl)) as SiteConfigModule;
    const rawConfig = configModule.default ?? configModule.siteConfig ?? configModule.config;

    if (rawConfig === undefined) {
      throw new Error("Expected a default export, siteConfig export, or config export.");
    }

    return SiteConfigSchema.parse(rawConfig);
  } catch (error) {
    throw new Error(
      `Failed to load site config for siteSlug "${siteSlug}" at ${configPath}: ${formatUnknownError(
        error,
      )}`,
    );
  }
}
