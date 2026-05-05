import { Button, Container, Heading, ImageBlock, Section as PageSection, Text } from "@factory/ui";

export type ProductScenarioLineItem = {
  title: string;
  description: string;
};

export type ProductScenarioSectionProps = {
  anchorId: string;
  title: string;
  description: string;
  scenarioImage: string;
  scenarioImageAlt?: string | undefined;
  items: ProductScenarioLineItem[];
  cta?: { label: string; href: string } | undefined;
};

export function ProductScenarioSection({
  anchorId,
  cta,
  description,
  items,
  scenarioImage,
  scenarioImageAlt,
  title,
}: ProductScenarioSectionProps) {
  return (
    <PageSection className="energy-storage-product-scenario" id={anchorId}>
      <Container className="energy-storage-product-scenario__container">
        <header className="energy-storage-product-scenario__head">
          <Heading className="energy-storage-product-scenario__title" level={2}>
            {title}
          </Heading>
          <Text className="energy-storage-product-scenario__intro">{description}</Text>
        </header>
        <div className="energy-storage-product-scenario__figure">
          <ImageBlock
            alt={scenarioImageAlt ?? ""}
            className="energy-storage-product-scenario__image"
            src={scenarioImage}
          />
        </div>
        <ul className="energy-storage-product-scenario__cards" role="list">
          {items.map((item, index) => (
            <li className="energy-storage-product-scenario__card" key={`${item.title}-${index}`}>
              <Heading className="energy-storage-product-scenario__card-title" level={3}>
                {item.title}
              </Heading>
              <Text className="energy-storage-product-scenario__card-body">{item.description}</Text>
            </li>
          ))}
        </ul>
        {cta ? (
          <div className="energy-storage-product-scenario__cta-wrap">
            <Button className="energy-storage-product-scenario__cta" href={cta.href}>
              {cta.label}
            </Button>
          </div>
        ) : null}
      </Container>
    </PageSection>
  );
}
