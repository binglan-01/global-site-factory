function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function buildRobotsTxt(domain: string): string {
  const normalizedDomain = trimTrailingSlash(domain);

  return `User-agent: *\nAllow: /\n\nSitemap: ${normalizedDomain}/sitemap.xml\n`;
}
