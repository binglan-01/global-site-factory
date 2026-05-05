import type { Section } from "@factory/validators";
import { Button, Container, FormInput, Heading, Section as PageSection, Textarea } from "@factory/ui";

export type ContactFormSection = Extract<Section, { type: "contact-form" }>;

export type ContactFormProps = {
  section: ContactFormSection;
  siteSlug: string;
  pageUrl: string;
};

/** English defaults when JSON does not supply `fieldLabels`. */
const DEFAULT_FIELD_LABELS: NonNullable<ContactFormSection["fieldLabels"]> = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  message: "Message",
  submit: "Send request",
};

export function ContactForm({ pageUrl, section, siteSlug }: ContactFormProps) {
  const fieldLabels = { ...DEFAULT_FIELD_LABELS, ...(section.fieldLabels ?? {}) };

  return (
    <PageSection className="energy-storage-contact-form">
      <Container className="energy-storage-contact-form__shell">
        <Heading className="energy-storage-contact-form__title" level={2}>
          {section.title}
        </Heading>
        <form action="/api/lead" className="energy-storage-contact-form__grid" method="post">
          <FormInput name="companySlug" type="hidden" value={siteSlug} />
          <FormInput name="formId" type="hidden" value={section.formId} />
          <FormInput name="pageUrl" type="hidden" value={pageUrl} />
          <FormInput autoComplete="name" label={fieldLabels.name} name="name" required />
          <FormInput autoComplete="email" label={fieldLabels.email} name="email" required type="email" />
          <FormInput autoComplete="tel" label={fieldLabels.phone} name="phone" type="tel" />
          <FormInput autoComplete="organization" label={fieldLabels.company} name="company" type="text" />
          <Textarea label={fieldLabels.message} name="message" required />
          <Button className="energy-storage-contact-form__submit" type="submit">
            {fieldLabels.submit}
          </Button>
        </form>
      </Container>
    </PageSection>
  );
}
