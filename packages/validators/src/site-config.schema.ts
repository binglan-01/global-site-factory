import type { RefinementCtx } from "zod";
import { z } from "zod";
import type { LocalizedString } from "./localized-string";

const SiteSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Site slug must be lowercase kebab-case.");

const LocaleSchema = z
  .string()
  .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, "Locale must look like en or en-US.");

const LocalizedLabelSchema: z.ZodType<LocalizedString> = z.union([
  z.string().min(1, "Label cannot be empty."),
  z
    .record(z.string(), z.string().min(1))
    .superRefine((record, ctx) => {
      if (Object.keys(record).length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "Localized labels object cannot be empty.",
        });
      }
    }),
]);

const NavLinkSchema = z.object({
  label: LocalizedLabelSchema,
  href: z.string().min(1, "Navigation href is required."),
});

const FooterLinkLabelsSchema = z.object({
  privacy: LocalizedLabelSchema,
  terms: LocalizedLabelSchema,
});

/** Optional multi-column footer for themes that render grouped footer links */
const FooterColumnSchema = z.object({
  title: LocalizedLabelSchema,
  links: z.array(NavLinkSchema),
});

/** Optional FAB items — surfaced by themes that render floating CTAs */
const FloatingActionLinkSchema = z.object({
  enabled: z.optional(z.boolean()),
  href: z.string().min(1, "Floating action href is required."),
  label: z.optional(LocalizedLabelSchema),
  ariaLabel: z.optional(LocalizedLabelSchema),
});

const FloatingActionsSchema = z.object({
  enquiry: z.optional(FloatingActionLinkSchema),
  document: z.optional(FloatingActionLinkSchema),
  support: z.optional(FloatingActionLinkSchema),
  backToTop: z
    .object({
      enabled: z.optional(z.boolean()),
      label: z.optional(LocalizedLabelSchema),
      ariaLabel: z.optional(LocalizedLabelSchema),
    })
    .optional(),
});

function assertLocalizedCoversLocales(
  value: LocalizedString,
  locales: string[],
  ctx: RefinementCtx,
  pathPrefix: (string | number)[],
): void {
  if (typeof value === "string") {
    return;
  }
  for (const loc of locales) {
    const text = value[loc];
    if (typeof text !== "string" || text.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: [...pathPrefix, loc],
        message: `Missing or empty value for locale "${loc}".`,
      });
    }
  }
}

export const SiteConfigSchema = z
  .object({
    slug: SiteSlugSchema,
    company: z.object({
      legalName: z.string().min(1, "Company legalName is required."),
      displayName: LocalizedLabelSchema,
      registeredCountry: z.string().min(1, "Company registeredCountry is required."),
      registeredAddress: z.string().min(1, "Company registeredAddress is required."),
      email: z.email("Company email must be a valid email address."),
      phone: z.string().min(1, "Company phone cannot be empty.").optional(),
      whatsapp: z.string().min(1, "Company whatsapp cannot be empty.").optional(),
    }),
    domain: z.url("Domain must be a valid URL."),
    industry: z.string().min(1, "Industry is required."),
    theme: z.enum(["enterprise", "technical-product-showcase", "energy-storage-showcase"]),
    locales: z.array(LocaleSchema).min(1, "At least one locale is required."),
    defaultLocale: LocaleSchema,
    navigation: z.array(NavLinkSchema),
    footerLinkLabels: FooterLinkLabelsSchema,
    seo: z.object({
      defaultTitle: z.string().min(1, "SEO defaultTitle is required."),
      titleTemplate: z.string().min(1, "SEO titleTemplate is required."),
      defaultDescription: z.string().min(1, "SEO defaultDescription is required."),
    }),
    legal: z.object({
      privacyEmail: z.email("Legal privacyEmail must be a valid email address."),
      dataController: z.string().min(1, "Legal dataController is required."),
    }),
    tracking: z
      .object({
        ga4Id: z.string().min(1, "GA4 ID cannot be empty.").optional(),
        gtmId: z.string().min(1, "GTM ID cannot be empty.").optional(),
        metaPixelId: z.string().min(1, "Meta Pixel ID cannot be empty.").optional(),
        googleAdsConversionId: z
          .string()
          .min(1, "Google Ads conversion ID cannot be empty.")
          .optional(),
      })
      .optional(),
    deploy: z
      .object({
        provider: z.literal("cloudflare-pages"),
        projectName: z.string().min(1, "Cloudflare Pages projectName is required."),
      })
      .optional(),
    footerColumns: z.optional(z.array(FooterColumnSchema)),
    floatingActions: z.optional(FloatingActionsSchema),
  })
  .superRefine((config, context) => {
    if (!config.locales.includes(config.defaultLocale)) {
      context.addIssue({
        code: "custom",
        path: ["defaultLocale"],
        message: "defaultLocale must be one of locales.",
      });
    }

    assertLocalizedCoversLocales(
      config.company.displayName,
      config.locales,
      context,
      ["company", "displayName"],
    );

    config.navigation.forEach((item, index) => {
      assertLocalizedCoversLocales(item.label, config.locales, context, ["navigation", index, "label"]);
    });

    assertLocalizedCoversLocales(
      config.footerLinkLabels.privacy,
      config.locales,
      context,
      ["footerLinkLabels", "privacy"],
    );
    assertLocalizedCoversLocales(
      config.footerLinkLabels.terms,
      config.locales,
      context,
      ["footerLinkLabels", "terms"],
    );

    config.footerColumns?.forEach((column, columnIndex) => {
      assertLocalizedCoversLocales(column.title, config.locales, context, ["footerColumns", columnIndex, "title"]);
      column.links.forEach((link, linkIndex) => {
        assertLocalizedCoversLocales(link.label, config.locales, context, [
          "footerColumns",
          columnIndex,
          "links",
          linkIndex,
          "label",
        ]);
      });
    });

    const fab = config.floatingActions;
    if (fab) {
      if (fab.enquiry?.label !== undefined) {
        assertLocalizedCoversLocales(fab.enquiry.label, config.locales, context, ["floatingActions", "enquiry", "label"]);
      }
      if (fab.enquiry?.ariaLabel !== undefined) {
        assertLocalizedCoversLocales(fab.enquiry.ariaLabel, config.locales, context, [
          "floatingActions",
          "enquiry",
          "ariaLabel",
        ]);
      }
      if (fab.document?.label !== undefined) {
        assertLocalizedCoversLocales(fab.document.label, config.locales, context, ["floatingActions", "document", "label"]);
      }
      if (fab.document?.ariaLabel !== undefined) {
        assertLocalizedCoversLocales(fab.document.ariaLabel, config.locales, context, [
          "floatingActions",
          "document",
          "ariaLabel",
        ]);
      }
      if (fab.support?.label !== undefined) {
        assertLocalizedCoversLocales(fab.support.label, config.locales, context, ["floatingActions", "support", "label"]);
      }
      if (fab.support?.ariaLabel !== undefined) {
        assertLocalizedCoversLocales(fab.support.ariaLabel, config.locales, context, [
          "floatingActions",
          "support",
          "ariaLabel",
        ]);
      }
      if (fab.backToTop?.label !== undefined) {
        assertLocalizedCoversLocales(fab.backToTop.label, config.locales, context, ["floatingActions", "backToTop", "label"]);
      }
      if (fab.backToTop?.ariaLabel !== undefined) {
        assertLocalizedCoversLocales(fab.backToTop.ariaLabel, config.locales, context, [
          "floatingActions",
          "backToTop",
          "ariaLabel",
        ]);
      }
    }
  });

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export function defineSiteConfig(config: unknown): SiteConfig {
  return SiteConfigSchema.parse(config);
}
