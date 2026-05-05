import { Fragment, useEffect, useState } from "react";
import { Container } from "@factory/ui";
import type { HeaderLanguageLink, HeaderNavItem, HeaderProps as EnterpriseHeaderProps } from "@factory/theme-enterprise";

export function Header(props: EnterpriseHeaderProps) {
  const { className, companyName, homeHref, languageLinks, navigation } = props;
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerClassList = ["energy-storage-header", solid ? "energy-storage-header--solid" : "", className]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    function onScroll(): void {
      setSolid(window.scrollY > 48);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showLanguageSwitcher = languageLinks !== undefined && languageLinks.length >= 2;

  return (
    <header className={headerClassList}>
      <Container className="energy-storage-header__container">
        <a className="energy-storage-header__brand" href={homeHref}>
          {companyName}
        </a>
        <nav aria-label="Primary navigation" className="energy-storage-header__desktop-nav">
          {navigation.map((item: HeaderNavItem) => (
            <a
              className="energy-storage-header__nav-link"
              href={item.href}
              key={`${item.label}-${item.href}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="energy-storage-header__actions">
          {showLanguageSwitcher ? (
            <nav aria-label="Languages" className="energy-storage-header__lang-desktop">
              {languageLinks!.map((link: HeaderLanguageLink, index: number) => (
                <Fragment key={link.locale}>
                  {index > 0 ? (
                    <span aria-hidden="true" className="energy-storage-header__sep">
                      |
                    </span>
                  ) : null}
                  {link.current ? (
                    <span
                      aria-current="true"
                      className="energy-storage-header__pill energy-storage-header__pill--current"
                      lang={link.locale}
                    >
                      {link.label}
                    </span>
                  ) : (
                    <a className="energy-storage-header__pill" href={link.href} hrefLang={link.locale} lang={link.locale}>
                      {link.label}
                    </a>
                  )}
                </Fragment>
              ))}
            </nav>
          ) : null}
          <button
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="energy-storage-mobile-menu"
            aria-label="Toggle navigation"
            className="energy-storage-header__burger"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </Container>
      <div
        className={[
          "energy-storage-mobile",
          menuOpen ? "energy-storage-mobile--open" : "energy-storage-mobile--closed",
        ].join(" ")}
        id="energy-storage-mobile-menu"
      >
        <nav aria-label="Mobile primary navigation">
          <ul className="energy-storage-mobile__list">
            {navigation.map((item) => (
              <li key={`${item.href}-m`}>
                <a className="energy-storage-mobile__link" href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {showLanguageSwitcher ? (
          <nav aria-label="Mobile languages" className="energy-storage-mobile__lang-nav">
            {languageLinks!.map((link) =>
              link.current ? (
                <span aria-current="true" className="energy-storage-mobile__lang-chip" lang={link.locale} key={link.locale}>
                  {link.label}
                </span>
              ) : (
                <a className="energy-storage-mobile__lang-chip" href={link.href} hrefLang={link.locale} lang={link.locale} key={link.locale}>
                  {link.label}
                </a>
              ),
            )}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
