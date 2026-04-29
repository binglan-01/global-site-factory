import type { Section } from "@factory/validators";
import { Button, Container, Heading, Section as PageSection, Text } from "@factory/ui";

export type ContactBlockSection = Extract<Section, { type: "contact-block" }>;
export type ContactBlockChannel = NonNullable<ContactBlockSection["channels"]>[number];
export type ContactBlockCta = NonNullable<ContactBlockSection["cta"]>;

export type ContactBlockProps = {
  section: ContactBlockSection;
  className?: string;
  email?: string;
  phone?: string;
};

export function ContactBlock({ className, email, phone, section }: ContactBlockProps) {
  const sectionClassName = ["tps-contact-block", className].filter(Boolean).join(" ");
  const channels = section.channels ?? [];

  return (
    <PageSection className={sectionClassName}>
      <Container className="tps-contact-block__container">
        <Heading className="tps-contact-block__title">{section.title}</Heading>
        <Text className="tps-contact-block__description">{section.description}</Text>
        <div className="tps-contact-block__details">
          {channels.map((channel) =>
            channel.href ? (
              <a className="tps-contact-block__link" href={channel.href} key={channel.label}>
                {channel.label}: {channel.value}
              </a>
            ) : (
              <Text className="tps-contact-block__detail" key={channel.label}>
                {channel.label}: {channel.value}
              </Text>
            ),
          )}
          {email ? (
            <a className="tps-contact-block__link" href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
          {phone ? (
            <a className="tps-contact-block__link" href={`tel:${phone}`}>
              {phone}
            </a>
          ) : null}
        </div>
        {section.cta ? (
          <Button className="tps-contact-block__cta" href={section.cta.href}>
            {section.cta.label}
          </Button>
        ) : null}
      </Container>
    </PageSection>
  );
}
