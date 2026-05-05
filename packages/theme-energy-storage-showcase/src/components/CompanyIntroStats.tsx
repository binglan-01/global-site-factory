import { Button, Heading, Section as PageSection, Text } from "@factory/ui";
import type { Section } from "@factory/validators";

export type StatsSection = Extract<Section, { type: "stats" }>;

export type CompanyIntroStatsProps = {
  intro?: StatsSection["intro"];
  stats: StatsSection["items"];
  aboutCta?: StatsSection["aboutCta"];
};

export function CompanyIntroStats({ aboutCta, intro, stats }: CompanyIntroStatsProps) {
  return (
    <PageSection className="energy-storage-intro-stats">
      <div className="energy-storage-intro-stats__shell">
        {intro ? <Text className="energy-storage-intro-stats__intro">{intro}</Text> : null}
        <div className="energy-storage-intro-stats__metric-grid" role="list">
          {stats.map((stat) => (
            <div className="energy-storage-intro-stats__metric" key={`${stat.value}-${stat.label}`} role="listitem">
              <span className="energy-storage-intro-stats__value">{stat.value}</span>
              <Heading className="energy-storage-intro-stats__label" level={3}>
                {stat.label}
              </Heading>
              {stat.description ? <Text className="energy-storage-intro-stats__meta">{stat.description}</Text> : null}
            </div>
          ))}
        </div>
        {aboutCta ? (
          <Button className="energy-storage-intro-stats__about" href={aboutCta.href}>
            {aboutCta.label}
          </Button>
        ) : null}
      </div>
    </PageSection>
  );
}
