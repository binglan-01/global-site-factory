import type { Section } from "@factory/validators";
import { Button, Container, Heading, Section as PageSection, Text } from "@factory/ui";

export type ContactBlockSection = Extract<Section, { type: "contact-block" }>;
export type ContactBlockChannel = NonNullable<ContactBlockSection["channels"]>[number];

export type ContactBlockProps = {
  section: ContactBlockSection;
  className?: string;
  email?: string;
  phone?: string;
};

export function ContactBlock({ className, email, phone, section }: ContactBlockProps) {
  const rootClass = ["energy-storage-contact-block", className].filter(Boolean).join(" ");
  const channels = section.channels ?? [];

  return (
    <PageSection className={rootClass}>
      <Container className="energy-storage-contact-block__shell">
        <Heading className="energy-storage-contact-block__title" level={2}>
          {section.title}
        </Heading>
        <Text className="energy-storage-contact-block__desc">{section.description}</Text>
        <div className="energy-storage-contact-block__channels">
          {channels.map((channel: ContactBlockChannel) =>
            channel.href ? (
              <a className="energy-storage-contact-block__chip" href={channel.href} key={channel.label}>
                <span>{channel.label}</span>
                <span className="energy-storage-contact-block__value">{channel.value}</span>
              </a>
            ) : (
              <span className="energy-storage-contact-block__detail" key={channel.label}>
                <strong>{channel.label}: </strong>
                <span>{channel.value}</span>
              </span>
            ),
          )}
          {email ? (
            <a className="energy-storage-contact-block__chip" href={`mailto:${email}`}>
              {email}
            </a>
          ) : null}
          {phone ? (
            <a className="energy-storage-contact-block__chip" href={`tel:${phone}`}>
              {phone}
            </a>
          ) : null}
        </div>
        {section.cta ? (
          <Button className="energy-storage-contact-block__cta" href={section.cta.href}>
            {section.cta.label}
          </Button>
        ) : null}
      </Container>
    </PageSection>
  );
}
