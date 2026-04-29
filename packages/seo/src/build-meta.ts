export function buildPageTitle(pageTitle: string, titleTemplate: string): string {
  return titleTemplate.replace("%s", pageTitle);
}
