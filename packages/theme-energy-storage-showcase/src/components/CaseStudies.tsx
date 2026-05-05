import type { CaseStudiesProps as ThemeCaseStudiesProps } from "@factory/theme-enterprise";

import { NewsActivityGrid } from "./NewsActivityGrid";

export type CaseStudiesProps = ThemeCaseStudiesProps;

export function CaseStudies({ section }: CaseStudiesProps) {
  return <NewsActivityGrid section={section} />;
}
