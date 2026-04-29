import { extname, join, normalize, relative, resolve } from "node:path";
import { readdir } from "node:fs/promises";
import { getSiteAssetsDir } from "./paths";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"]);

function assetDirToRelativeFsPath(assetDir: string): string {
  const withoutAssets = assetDir.replace(/^\/assets\/?/, "");
  const trimmed = withoutAssets.replace(/\/$/, "");
  if (!trimmed || trimmed.includes("..")) {
    throw new Error(`Invalid assetDir: ${assetDir}`);
  }
  const segments = trimmed.split("/").filter(Boolean);
  for (const segment of segments) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment)) {
      throw new Error(`Invalid assetDir segment: ${assetDir}`);
    }
  }
  return trimmed;
}

function isResolvedPathInsideAssets(assetsRoot: string, candidateDir: string): boolean {
  const root = resolve(assetsRoot);
  const candidate = resolve(candidateDir);
  const rel = relative(root, candidate);
  return rel !== "" && !rel.startsWith("..") && !normalize(rel).startsWith("..");
}

/**
 * Lists public `/assets/...` URLs for image files directly under the directory
 * matching `assetDir` (not recursive). Sorted by natural filename order.
 */
export async function listGalleryImagePublicPaths(
  siteSlug: string,
  assetDir: string,
): Promise<string[]> {
  const relativeDir = assetDirToRelativeFsPath(assetDir);
  const assetsRoot = getSiteAssetsDir(siteSlug);
  const absDir = normalize(join(assetsRoot, relativeDir));
  if (!isResolvedPathInsideAssets(assetsRoot, absDir)) {
    throw new Error(`assetDir resolves outside site assets: ${assetDir}`);
  }

  let entries: import("node:fs").Dirent[];
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const basePublic = assetDir.replace(/\/$/, "");
  return names.map((name) => `${basePublic}/${name}`);
}
