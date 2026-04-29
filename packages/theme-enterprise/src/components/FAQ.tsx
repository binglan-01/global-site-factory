import type { Section } from "@factory/validators";
import { Container, Heading, Section as PageSection, Text } from "@factory/ui";

export type FaqSection = Extract<Section, { type: "faq" }>;
export type FAQItem = FaqSection["items"][number];

export type FAQProps = {
  section: FaqSection;
  className?: string;
};

export function FAQ({ className, section }: FAQProps) {
  const sectionClassName = ["enterprise-faq", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="enterprise-faq__container">
        <Heading className="enterprise-faq__title">{section.title}</Heading>
        <div className="enterprise-faq__list">
          {section.items.map((item) => (
            <details className="enterprise-faq__item" key={item.question}>
              <summary className="enterprise-faq__question">{item.question}</summary>
              <Text className="enterprise-faq__answer">{item.answer}</Text>
            </details>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}
