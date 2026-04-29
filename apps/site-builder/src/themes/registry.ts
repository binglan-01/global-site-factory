import type { ComponentType } from "react";
import type {
  CaseStudiesProps,
  CertificatesProps,
  ContactBlockProps,
  ContactFormProps,
  FAQProps,
  FeatureListProps,
  FooterLink,
  FooterProps,
  GalleryProps,
  HeaderNavItem,
  HeaderProps,
  HeroProps,
  ImageTextProps,
  ProcessStepsProps,
  ServicesGridProps,
  StatsProps,
} from "@factory/theme-enterprise";
import type { SiteConfig } from "@factory/validators";
import * as enterprise from "@factory/theme-enterprise";
import * as technicalProductShowcase from "@factory/theme-technical-product-showcase";

/**
 * Theme registry for `apps/site-builder`.
 *
 * Adding a new theme requires three steps:
 *  1. Add the theme ID to `theme` in `packages/validators/src/site-config.schema.ts`.
 *  2. Add the package as a workspace dependency in `apps/site-builder/package.json`
 *     and register the path alias in both `tsconfig.base.json` and
 *     `apps/site-builder/tsconfig.json`.
 *  3. Append a row to `themeBundles` below. TypeScript's `Record<ThemeId, ...>`
 *     constraint will refuse to compile until every theme ID has an entry.
 *
 * Cross-theme prop types (HeaderProps / FooterProps / *Section / *Props) are
 * imported from `@factory/theme-enterprise` purely as the canonical typing
 * source — every theme package exports structurally identical contracts, so
 * picking enterprise as the type origin does not couple this registry to it.
 */
export type ThemeId = SiteConfig["theme"];

export type ThemeBundle = {
  Header: ComponentType<HeaderProps>;
  Footer: ComponentType<FooterProps>;
  Hero: ComponentType<HeroProps>;
  ServicesGrid: ComponentType<ServicesGridProps>;
  Gallery: ComponentType<GalleryProps>;
  ContactForm: ComponentType<ContactFormProps>;
  FeatureList: ComponentType<FeatureListProps>;
  ImageText: ComponentType<ImageTextProps>;
  CaseStudies: ComponentType<CaseStudiesProps>;
  ProcessSteps: ComponentType<ProcessStepsProps>;
  Stats: ComponentType<StatsProps>;
  FAQ: ComponentType<FAQProps>;
  Certificates: ComponentType<CertificatesProps>;
  ContactBlock: ComponentType<ContactBlockProps>;
};

const themeBundles: Record<ThemeId, ThemeBundle> = {
  enterprise: {
    Header: enterprise.Header,
    Footer: enterprise.Footer,
    Hero: enterprise.Hero,
    ServicesGrid: enterprise.ServicesGrid,
    Gallery: enterprise.Gallery,
    ContactForm: enterprise.ContactForm,
    FeatureList: enterprise.FeatureList,
    ImageText: enterprise.ImageText,
    CaseStudies: enterprise.CaseStudies,
    ProcessSteps: enterprise.ProcessSteps,
    Stats: enterprise.Stats,
    FAQ: enterprise.FAQ,
    Certificates: enterprise.Certificates,
    ContactBlock: enterprise.ContactBlock,
  },
  "technical-product-showcase": {
    Header: technicalProductShowcase.Header,
    Footer: technicalProductShowcase.Footer,
    Hero: technicalProductShowcase.Hero,
    ServicesGrid: technicalProductShowcase.ServicesGrid,
    Gallery: technicalProductShowcase.Gallery,
    ContactForm: technicalProductShowcase.ContactForm,
    FeatureList: technicalProductShowcase.FeatureList,
    ImageText: technicalProductShowcase.ImageText,
    CaseStudies: technicalProductShowcase.CaseStudies,
    ProcessSteps: technicalProductShowcase.ProcessSteps,
    Stats: technicalProductShowcase.Stats,
    FAQ: technicalProductShowcase.FAQ,
    Certificates: technicalProductShowcase.Certificates,
    ContactBlock: technicalProductShowcase.ContactBlock,
  },
};

export function getThemeBundle(themeId: ThemeId): ThemeBundle {
  return themeBundles[themeId];
}

export type { FooterLink, HeaderNavItem };
