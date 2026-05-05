import { Container, Heading, Section as PageSection, Text } from "@factory/ui";
import type { ProcessStepsProps as ThemeStepsProps } from "@factory/theme-enterprise";

export type ProcessStepsProps = ThemeStepsProps;

export function ProcessSteps({ section }: ProcessStepsProps) {
  return (
    <PageSection className="energy-storage-process">
      <Container className="energy-storage-process__shell">
        <Heading className="energy-storage-process__title" level={2}>
          {section.title}
        </Heading>
        <ol className="energy-storage-process__list">
          {section.steps.map((step, ix) => (
            <li className="energy-storage-process__step" key={`${step.title}-${ix}`}>
              <span className="energy-storage-process__index">{`${ix + 1}`.padStart(2, "0")}</span>
              <div className="energy-storage-process__body">
                <Heading className="energy-storage-process__step-title" level={3}>
                  {step.title}
                </Heading>
                <Text>{step.description}</Text>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </PageSection>
  );
}
