import type { StatsProps as ThemeStatsProps } from "@factory/theme-enterprise";

import { CompanyIntroStats } from "./CompanyIntroStats";

export type StatsProps = ThemeStatsProps;

export function Stats({ section }: StatsProps) {
  return <CompanyIntroStats aboutCta={section.aboutCta} intro={section.intro} stats={section.items} />;
}
