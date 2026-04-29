import { z } from "zod";

const SiteSlugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Site slug must be lowercase kebab-case.");

const LocaleSchema = z
  .string()
  .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, "Locale must look like en or en-US.");

const LinkSchema = z.object({
  label: z.string().min(1, "Navigation label is required."),
  href: z.string().min(1, "Navigation href is required."),
});

export const SiteConfigSchema = z
  .object({
    slug: SiteSlugSchema,
    company: z.object({
      legalName: z.string().min(1, "Company legalName is required."),
      displayName: z.string().min(1, "Company displayName is required."),
      registeredCountry: z.string().min(1, "Company registeredCountry is required."),
      registeredAddress: z.string().min(1, "Company registeredAddress is required."),
      email: z.email("Company email must be a valid email address."),
      phone: z.string().min(1, "Company phone cannot be empty.").optional(),
      whatsapp: z.string().min(1, "Company whatsapp cannot be empty.").optional(),
    }),
    domain: z.url("Domain must be a valid URL."),
    industry: z.string().min(1, "Industry is required."),
    theme: z.enum(["enterprise", "technical-product-showcase"]),
    locales: z.array(LocaleSchema).min(1, "At least one locale is required."),
    defaultLocale: LocaleSchema,
    navigation: z.array(LinkSchema),
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
  })
  .superRefine((config, context) => {
    if (!config.locales.includes(config.defaultLocale)) {
      context.addIssue({
        code: "custom",
        path: ["defaultLocale"],
        message: "defaultLocale must be one of locales.",
      });
    }
  });

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export function defineSiteConfig(config: unknown): SiteConfig {
  return SiteConfigSchema.parse(config);
}
