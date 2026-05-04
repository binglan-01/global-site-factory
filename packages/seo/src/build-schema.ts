import { resolveLocalizedString, type SiteConfig } from "@factory/validators";

export type OrganizationSchema = {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  legalName: string;
  url: string;
  email: string;
  address: string;
};

export function buildOrganizationSchema(siteConfig: SiteConfig): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: resolveLocalizedString(
      siteConfig.company.displayName,
      siteConfig.defaultLocale,
      siteConfig.defaultLocale,
    ),
    legalName: siteConfig.company.legalName,
    url: siteConfig.domain,
    email: siteConfig.company.email,
    address: siteConfig.company.registeredAddress,
  };
}
