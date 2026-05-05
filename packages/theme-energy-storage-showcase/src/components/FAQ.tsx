import { Container, Heading, Section as PageSection, Text } from "@factory/ui";
import type { FAQProps as ThemeFaqProps } from "@factory/theme-enterprise";

export type FAQProps = ThemeFaqProps;

export function FAQ({ section }: FAQProps) {
  return (
    <PageSection className="energy-storage-faq">
      <Container className="energy-storage-faq__shell">
        <Heading className="energy-storage-faq__title" level={2}>
          {section.title}
        </Heading>
        <div className="energy-storage-faq__list">
          {section.items.map((item) => (
            <details className="energy-storage-faq__details" key={item.question}>
              <summary className="energy-storage-faq__question">{item.question}</summary>
              <Text className="energy-storage-faq__answer">{item.answer}</Text>
            </details>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}
