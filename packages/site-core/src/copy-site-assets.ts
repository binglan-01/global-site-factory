import { cp, mkdir, rm } from "node:fs/promises";
import { getSiteAssetsDir } from "./paths";

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function copySiteAssets(siteSlug: string, targetAssetsDir: string): Promise<void> {
  const sourceAssetsDir = getSiteAssetsDir(siteSlug);

  try {
    await rm(targetAssetsDir, { recursive: true, force: true });
    await mkdir(targetAssetsDir, { recursive: true });
  } catch (error) {
    throw new Error(
      `Failed to prepare assets directory for siteSlug "${siteSlug}" at ${targetAssetsDir}: ${formatUnknownError(
        error,
      )}`,
    );
  }

  try {
    await cp(sourceAssetsDir, targetAssetsDir, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      return;
    }

    throw new Error(
      `Failed to copy assets for siteSlug "${siteSlug}" from ${sourceAssetsDir} to ${targetAssetsDir}: ${formatUnknownError(
        error,
      )}`,
    );
  }
}
