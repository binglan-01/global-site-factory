import type { Section } from "@factory/validators";
import { Card, Container, Grid, Heading, Section as PageSection, Text } from "@factory/ui";

export type ProcessStepsSection = Extract<Section, { type: "process-steps" }>;
export type ProcessStepItem = ProcessStepsSection["steps"][number];

export type ProcessStepsProps = {
  section: ProcessStepsSection;
  className?: string;
};

export function ProcessSteps({ className, section }: ProcessStepsProps) {
  const sectionClassName = ["tps-process", className].filter(Boolean).join(" ");

  return (
    <PageSection className={sectionClassName}>
      <Container className="tps-process__container">
        <Heading className="tps-process__title">{section.title}</Heading>
        <Grid className="tps-process__grid" columns={4}>
          {section.steps.map((step, index) => (
            <Card className="tps-process__step" key={step.title}>
              <Text aria-hidden="true" className="tps-process__number">
                {String(index + 1).padStart(2, "0")}
              </Text>
              <Heading className="tps-process__step-title" level={3}>
                {step.title}
              </Heading>
              <Text className="tps-process__step-description">{step.description}</Text>
            </Card>
          ))}
        </Grid>
      </Container>
    </PageSection>
  );
}
