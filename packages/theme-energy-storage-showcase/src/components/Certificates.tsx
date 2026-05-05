import { Container, Heading, Section as PageSection, Text } from "@factory/ui";
import type { CertificatesProps as ThemeCertsProps } from "@factory/theme-enterprise";

export type CertificatesProps = ThemeCertsProps;

export function Certificates({ section }: CertificatesProps) {
  return (
    <PageSection className="energy-storage-cert">
      <Container className="energy-storage-cert__shell">
        <Heading className="energy-storage-cert__title" level={2}>
          {section.title}
        </Heading>
        <div className="energy-storage-cert__grid">
          {section.items.map((item) => (
            <figure className="energy-storage-cert__card" key={item.title}>
              {item.image ? (
                <div
                  aria-hidden
                  className="energy-storage-cert__media"
                  style={{ backgroundImage: `url(${JSON.stringify(item.image)})` }}
                />
              ) : (
                <div aria-hidden className="energy-storage-cert__media energy-storage-cert__media--muted" />
              )}
              <figcaption className="energy-storage-cert__caption">
                <Heading className="energy-storage-cert__label" level={3}>
                  {item.title}
                </Heading>
                {item.description ? <Text>{item.description}</Text> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}
