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
  const footerClassName = ["tps-footer", className].filter(Boolean).join(" ");

  return (
    <footer className={footerClassName}>
      <Container className="tps-footer__container">
        <Text className="tps-footer__company">{companyName}</Text>
        <nav aria-label="Footer navigation" className="tps-footer__nav">
          {links.map((link) => (
            <a
              className="tps-footer__link"
              href={link.href}
              key={`${link.label}-${link.href}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        {copyrightText ? (
          <Text className="tps-footer__copyright">{copyrightText}</Text>
        ) : null}
      </Container>
    </footer>
  );
}
