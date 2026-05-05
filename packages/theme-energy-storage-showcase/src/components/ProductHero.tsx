import { Button, Heading, Text } from "@factory/ui";
import type { Section } from "@factory/validators";

type HeroPageSection = Extract<Section, { type: "hero" }>;

export type ProductHeroProps = {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  image?: string | undefined;
  imageAlt?: string | undefined;
  tabs?: HeroPageSection["tabs"];
  primaryCta?: HeroPageSection["primaryCta"];
  /** When true, do not render placeholder `#fragment` divs — target sections must expose matching `id`. */
  hideTabFragmentAnchors?: boolean | undefined;
};

function hashTargetsFromTabs(tabs: NonNullable<ProductHeroProps["tabs"]>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tab of tabs) {
    const hashIdx = tab.href.indexOf("#");
    if (hashIdx < 0) {
      continue;
    }
    const raw = tab.href.slice(hashIdx + 1).trim();
    if (!/^[a-zA-Z][\w-]*$/.test(raw) || seen.has(raw)) {
      continue;
    }
    seen.add(raw);
    out.push(raw);
  }
  return out;
}

export function ProductHero(props: ProductHeroProps) {
  const style =
    props.image !== undefined ? { backgroundImage: `url(${JSON.stringify(props.image)})` } : undefined;

  const tabHashes = props.tabs && props.tabs.length > 0 ? hashTargetsFromTabs(props.tabs) : [];
  const renderTabFragments = !props.hideTabFragmentAnchors;

  return (
    <section aria-label={props.title} className="energy-storage-product-hero" style={style}>
      {renderTabFragments
        ? tabHashes.map((id) => (
            <div aria-hidden className="energy-storage-hash-target" id={id} key={`fragment-${id}`} />
          ))
        : null}
      <div className="energy-storage-product-hero__scrim" />
      <div className="energy-storage-product-hero__inner">
        {props.eyebrow ? <p className="energy-storage-product-hero__eyebrow">{props.eyebrow}</p> : null}
        <Heading className="energy-storage-product-hero__title" level={1}>
          {props.title}
        </Heading>
        {props.description ? (
          <Text className="energy-storage-product-hero__desc">{props.description}</Text>
        ) : null}
        {props.primaryCta ? (
          <Button className="energy-storage-product-hero__cta" href={props.primaryCta.href}>
            {props.primaryCta.label}
          </Button>
        ) : null}
        {props.tabs && props.tabs.length > 0 ? (
          <nav aria-label="Product categories" className="energy-storage-product-hero__tabs-wrap">
            <ul className="energy-storage-product-hero__tabs" role="tablist">
              {props.tabs.map((tab, index) => (
                <li className="energy-storage-product-hero__tabs-item" key={`${tab.label}-${tab.href}-${index}`}>
                  <a className="energy-storage-product-hero__tab" href={tab.href}>
                    {tab.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
