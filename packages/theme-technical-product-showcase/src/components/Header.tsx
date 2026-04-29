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
  const headerClassName = ["tps-header", className].filter(Boolean).join(" ");
  const showLanguageSwitcher = languageLinks !== undefined && languageLinks.length >= 2;

  return (
    <header className={headerClassName}>
      <Container className="tps-header__container">
        <a className="tps-header__brand" href={homeHref}>
          {companyName}
        </a>
        <nav aria-label="Primary navigation" className="tps-header__nav">
          {navigation.map((item) => (
            <a
              className="tps-header__nav-link"
              href={item.href}
              key={`${item.label}-${item.href}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="tps-header__actions">
          {showLanguageSwitcher ? (
            <nav aria-label="Languages" className="tps-header__lang">
              {languageLinks.map((link, index) => (
                <Fragment key={link.locale}>
                  {index > 0 ? (
                    <span aria-hidden="true" className="tps-header__lang-sep">
                      |
                    </span>
                  ) : null}
                  {link.current ? (
                    <span
                      aria-current="true"
                      className="tps-header__lang-link tps-header__lang-link--active"
                      lang={link.locale}
                    >
                      {link.label}
                    </span>
                  ) : (
                    <a
                      className="tps-header__lang-link"
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
          <button aria-label="Search" className="tps-header__search" type="button">
            <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
          </button>
        </div>
      </Container>
    </header>
  );
}
