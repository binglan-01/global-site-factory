import { Fragment } from "react";
import { Container } from "@factory/ui";

export type HeaderNavItem = {
  label: string;
  href: string;
};

export type HeaderLanguageLink = {
  label: string;
  href: string;
  locale: string;
  current: boolean;
};

export type HeaderProps = {
  companyName: string;
  homeHref: string;
  navigation: HeaderNavItem[];
  className?: string;
  languageLinks?: HeaderLanguageLink[];
};

export function Header({ className, companyName, homeHref, navigation, languageLinks }: HeaderProps) {
  const headerClassName = ["enterprise-header", className].filter(Boolean).join(" ");
  const showLanguageSwitcher = languageLinks !== undefined && languageLinks.length >= 2;

  return (
    <header className={headerClassName}>
      <Container className="enterprise-header__container">
        <a className="enterprise-header__brand" href={homeHref}>
          {companyName}
        </a>
        <div className="enterprise-header__end">
          <nav aria-label="Primary navigation" className="enterprise-header__nav">
            {navigation.map((item) => (
              <a className="enterprise-header__nav-link" href={item.href} key={`${item.label}-${item.href}`}>
                {item.label}
              </a>
            ))}
          </nav>
          {showLanguageSwitcher ? (
            <nav aria-label="Languages" className="enterprise-header__lang">
              {languageLinks.map((link, index) => (
                <Fragment key={link.locale}>
                  {index > 0 ? (
                    <span aria-hidden="true" className="enterprise-header__lang-sep">
                      |
                    </span>
                  ) : null}
                  {link.current ? (
                    <span
                      aria-current="true"
                      className="enterprise-header__lang-link enterprise-header__lang-link--active"
                      lang={link.locale}
                    >
                      {link.label}
                    </span>
                  ) : (
                    <a
                      className="enterprise-header__lang-link"
                      href={link.href}
                      hrefLang={link.locale}
                      lang={link.locale}
                    >
                      {link.label}
                    </a>
                  )}
                </Fragment>
              ))}
            </nav>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
