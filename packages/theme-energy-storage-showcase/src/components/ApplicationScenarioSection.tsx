import { Button, Container, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type ApplicationScenarioSectionProps = {
  title: string;
  description: string;
  image?: string | undefined;
  imageAlt?: string | undefined;
  reverse?: boolean | undefined;
  cta?: { label: string; href: string } | undefined;
};

export function ApplicationScenarioSection({
  cta,
  description,
  image,
  imageAlt,
  reverse,
  title,
}: ApplicationScenarioSectionProps) {
  const dir = reverse ? "energy-storage-scenario-layout--reverse" : "";

  return (
    <PageSection className="energy-storage-scenario">
      <Container className="energy-storage-scenario__container">
        <div className={`energy-storage-scenario-layout ${dir}`.trim()}>
          <div className="energy-storage-scenario-layout__copy">
            <Heading className="energy-storage-scenario__title" level={2}>
              {title}
            </Heading>
            <Text>{description}</Text>
            {cta ? (
              <Button className="energy-storage-scenario__cta" href={cta.href}>
                {cta.label}
              </Button>
            ) : null}
          </div>
          <div className="energy-storage-scenario-layout__diagram">
            {image ? (
              <ImageBlock alt={imageAlt ?? ""} className="energy-storage-scenario__image" src={image} />
            ) : (
              <div aria-hidden className="energy-storage-scenario__dummy" />
            )}
          </div>
        </div>
      </Container>
    </PageSection>
  );
}
