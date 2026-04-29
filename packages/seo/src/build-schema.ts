import type { SiteConfig } from "@factory/validators";

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
    name: siteConfig.company.displayName,
    legalName: siteConfig.company.legalName,
    url: siteConfig.domain,
    email: siteConfig.company.email,
    address: siteConfig.company.registeredAddress,
  };
}
