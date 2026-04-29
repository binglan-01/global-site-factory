import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, Section as PageSection, Text } from "@factory/ui";

export type ProcessStepsSection = Extract<Section, { type: "process-steps" }>;
export type ProcessStepItem = ProcessStepsSection["steps"][number];

export type ProcessStepsProps = {
  section: ProcessStepsSection;
  className?: string;
};

export function ProcessSteps({ className, section }: ProcessStepsProps) {
  const sectionClassName = ["enterprise-process", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="enterprise-process__container">
        <Heading className="enterprise-process__title">{section.title}</Heading>
        <Grid className="enterprise-process__grid">
          {section.steps.map((step, index) => (
            <Card className="enterprise-process__step" key={step.title}>
              <Text className="enterprise-process__number">{String(index + 1).padStart(2, "0")}</Text>
              <Heading level={3}>{step.title}</Heading>
              <Text>{step.description}</Text>
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
