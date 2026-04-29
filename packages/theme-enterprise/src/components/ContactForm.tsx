import type { Section } from "@factory/validators";
import { Button, Container, FormInput, Heading, Section as PageSection, Textarea } from "@factory/ui";

export type ContactFormSection = Extract<Section, { type: "contact-form" }>;

export type ContactFormProps = {
  section: ContactFormSection;
  siteSlug: string;
  pageUrl: string;
};

export function ContactForm({ section, siteSlug, pageUrl }: ContactFormProps) {
  return (
    <PageSection className="enterprise-contact">
      <Container className="enterprise-contact__container">
        <Heading className="enterprise-contact__title">{section.title}</Heading>
        <form action="/api/lead" className="enterprise-contact__form" method="post">
          <FormInput name="companySlug" type="hidden" value={siteSlug} />
          <FormInput name="formId" type="hidden" value={section.formId} />
          <FormInput name="pageUrl" type="hidden" value={pageUrl} />
          <FormInput autoComplete="name" label="Name" name="name" required />
          <FormInput autoComplete="email" label="Email" name="email" required type="email" />
          <FormInput autoComplete="tel" label="Phone" name="phone" type="tel" />
          <Textarea label="Message" name="message" required />
          <Button type="submit">Send message</Button>
        </form>
      </Container>
    </PageSection>
  );
}
