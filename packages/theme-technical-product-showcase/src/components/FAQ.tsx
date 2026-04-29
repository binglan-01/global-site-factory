import type { Section } from "@factory/validators";
import { Container, Heading, Section as PageSection, Text } from "@factory/ui";

export type FaqSection = Extract<Section, { type: "faq" }>;
export type FAQItem = FaqSection["items"][number];

export type FAQProps = {
  section: FaqSection;
  className?: string;
};

export function FAQ({ className, section }: FAQProps) {
  const sectionClassName = ["tps-faq", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="tps-faq__container">
        <Heading className="tps-faq__title">{section.title}</Heading>
        <div className="tps-faq__list">
          {section.items.map((item) => (
            <details className="tps-faq__item" key={item.question}>
              <summary className="tps-faq__question">
                <span className="tps-faq__question-text">{item.question}</span>
                <span aria-hidden="true" className="tps-faq__chevron" />
              </summary>
              <Text className="tps-faq__answer">{item.answer}</Text>
            </details>
          ))}
        </div>
      </Container>
    </PageSection>
  );
}
