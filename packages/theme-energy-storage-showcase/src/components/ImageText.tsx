import type { ImageTextProps as ThemeImgProps } from "@factory/theme-enterprise";

import { ApplicationScenarioSection } from "./ApplicationScenarioSection";

export type ImageTextProps = ThemeImgProps;

export function ImageText({ section }: ImageTextProps) {
  return (
    <ApplicationScenarioSection
      cta={section.cta}
      description={section.description}
      image={section.image}
      imageAlt={section.imageAlt}
      reverse={section.reverse}
      title={section.title}
    />
  );
}
