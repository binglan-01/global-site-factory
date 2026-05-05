import type { FooterLink, FooterProps as EnterpriseFooterProps } from "@factory/theme-enterprise";

export function Footer(props: EnterpriseFooterProps) {
  const { className, companyName, copyrightText, footerColumns, links } = props;
  const rootClassName = ["energy-storage-footer", className].filter(Boolean).join(" ");

  return (
    <footer className={rootClassName}>
      {footerColumns && footerColumns.length > 0 ? (
        <div className="energy-storage-footer__multi">
          {footerColumns.map((column, index) => (
            <nav
              aria-label={column.title}
              className="energy-storage-footer__group"
              key={`${column.title}-${index}`}
            >
              <p className="energy-storage-footer__group-heading">{column.title}</p>
              <ul className="energy-storage-footer__list" role="list">
                {column.links.map((link: FooterLink) => (
                  <li key={`${link.label}-${link.href}`}>
                    <a className="energy-storage-footer__link" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      ) : null}
      <div className="energy-storage-footer__base">
        <p className="energy-storage-footer__company">{companyName}</p>
        <nav aria-label="Legal navigation" className="energy-storage-footer__legal">
          <ul className="energy-storage-footer__legal-row" role="list">
            {links.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a className="energy-storage-footer__legal-link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {copyrightText ? <p className="energy-storage-footer__copyright">{copyrightText}</p> : null}
      </div>
    </footer>
  );
}
