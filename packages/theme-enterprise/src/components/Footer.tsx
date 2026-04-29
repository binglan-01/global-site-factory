import { Container, Text } from "@factory/ui";

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterProps = {
  companyName: string;
  links: FooterLink[];
  className?: string;
  copyrightText?: string;
};

export function Footer({ className, companyName, copyrightText, links }: FooterProps) {
  const footerClassName = ["enterprise-footer", className].filter(Boolean).join(" ");

  return (
    <footer className={footerClassName}>
      <Container className="enterprise-footer__container">
        <Text className="enterprise-footer__company">{companyName}</Text>
        <nav aria-label="Footer navigation" className="enterprise-footer__nav">
          {links.map((link) => (
            <a className="enterprise-footer__link" href={link.href} key={`${link.label}-${link.href}`}>
              {link.label}
            </a>
          ))}
        </nav>
        {copyrightText ? <Text className="enterprise-footer__copyright">{copyrightText}</Text> : null}
      </Container>
    </footer>
  );
}
