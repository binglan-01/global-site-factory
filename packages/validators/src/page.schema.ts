import { z } from "zod";

const PageSlugSchema = z
  .string()
  .regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/?)*$/, "Page slug must be a valid path.");

const CtaSchema = z.object({
  label: z.string().min(1, "CTA label is required."),
  href: z.string().min(1, "CTA href is required."),
});

const TitleDescriptionItemSchema = z.object({
  title: z.string().min(1, "Item title is required."),
  description: z.string().min(1, "Item description is required."),
});

const HeroCarouselSlideSchema = z
  .object({
    /** Legacy image URL; use `image` for new authoring — either satisfies an image slide. */
    src: z.optional(z.string().min(1, "Carousel slide src cannot be empty.")),
    image: z.optional(z.string().min(1, "Carousel slide image cannot be empty.")),
    video: z.optional(z.string().min(1, "Carousel slide video cannot be empty.")),
    poster: z.optional(z.string().min(1, "Carousel slide poster cannot be empty.")),
    mediaType: z.optional(z.enum(["image", "video"])),
    alt: z.optional(z.string()),
    title: z.optional(z.string()),
  })
  .superRefine((slide, ctx) => {
    const isVideoSlide = slide.mediaType === "video" || Boolean(slide.video);
    if (isVideoSlide) {
      if (!slide.video && !slide.poster) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Video carousel slide requires at least one of "video" or "poster" (or use an image slide with src/image).',
          path: [],
        });
      }
      return;
    }
    const imageUrl = slide.image ?? slide.src;
    if (!imageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Image carousel slide requires "src" or "image"; or mark as video via "mediaType": "video" or set "video".',
        path: [],
      });
    }
  });

const HeroCarouselConfigSchema = z.object({
  images: z.array(HeroCarouselSlideSchema).min(1, "Carousel requires at least one image."),
  autoplay: z.optional(z.boolean()),
  intervalMs: z.optional(z.number().int().positive().max(120000)),
  perspective: z.optional(z.boolean()),
  lightbox: z.optional(z.boolean()),
});

const SiteRelativeHrefSchema = z
  .string()
  .min(1, "href cannot be empty.")
  .refine((value) => value.startsWith("/"), {
    message: "href must be a site-relative path starting with /.",
  });

const HeroSectionSchema = z.object({
  type: z.literal("hero"),
  eyebrow: z.optional(z.string().min(1, "Hero eyebrow cannot be empty.")),
  title: z.string().min(1, "Hero title is required."),
  description: z.string().min(1, "Hero description is required."),
  primaryCta: z.optional(CtaSchema),
  image: z.optional(z.string().min(1, "Hero image cannot be empty.")),
  imageAlt: z.optional(z.string().min(1, "Hero imageAlt cannot be empty.")),
  variant: z.optional(
    z.enum(["standard", "split-carousel", "fullscreen-carousel", "product-hero"]),
  ),
  carousel: z.optional(HeroCarouselConfigSchema),
  tabs: z.optional(
    z
      .array(
        z.object({
          label: z.string().min(1, "Hero tab label is required."),
          href: SiteRelativeHrefSchema,
        }),
      )
      .min(1, "Hero tabs must contain at least one item when provided."),
  ),
});

const ServicesGridSectionSchema = z.object({
  type: z.literal("services-grid"),
  title: z.string().min(1, "Services grid title is required."),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Service title is required."),
        description: z.string().min(1, "Service description is required."),
        href: z.optional(SiteRelativeHrefSchema),
      }),
    )
    .min(1, "Services grid requires at least one item."),
});

const GalleryLayoutSchema = z.enum(["standard", "product-grid"]);
const GalleryColumnsSchema = z.union([z.literal(2), z.literal(3), z.literal(4)]);
const GalleryImageAspectSchema = z.enum(["square", "landscape", "portrait"]);

const GalleryAssetDirSchema = z
  .string()
  .min(1, "assetDir cannot be empty.")
  .regex(
    /^\/assets\/(?:[a-z0-9]+(?:-[a-z0-9]+)*)(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    "assetDir must look like /assets/<kebab-segments> with no trailing slash.",
  );

const GallerySectionSchema = z
  .object({
    type: z.literal("gallery"),
    title: z.string().min(1, "Gallery title is required."),
    images: z.optional(z.array(z.string().min(1, "Gallery image cannot be empty."))),
    assetDir: z.optional(GalleryAssetDirSchema),
    layout: z.optional(GalleryLayoutSchema),
    columns: z.optional(GalleryColumnsSchema),
    imageAspect: z.optional(GalleryImageAspectSchema),
    lightbox: z.optional(z.boolean()),
    zoom: z.optional(z.boolean()),
  })
  .superRefine((data, ctx) => {
    const hasAssetDir = data.assetDir !== undefined && data.assetDir.length > 0;
    const hasImages = data.images !== undefined && data.images.length > 0;
    if (!hasAssetDir && !hasImages) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Gallery requires assetDir and/or a non-empty images array.",
        path: ["images"],
      });
    }
  });

const ContactFormFieldLabelsSchema = z
  .object({
    name: z.optional(z.string().min(1, "Contact form name label cannot be empty.")),
    email: z.optional(z.string().min(1, "Contact form email label cannot be empty.")),
    phone: z.optional(z.string().min(1, "Contact form phone label cannot be empty.")),
    company: z.optional(z.string().min(1, "Contact form company label cannot be empty.")),
    message: z.optional(z.string().min(1, "Contact form message label cannot be empty.")),
    submit: z.optional(z.string().min(1, "Contact form submit label cannot be empty.")),
  })
  .strict();

const ContactFormSectionSchema = z.object({
  type: z.literal("contact-form"),
  title: z.string().min(1, "Contact form title is required."),
  formId: z.string().min(1, "Contact form formId is required."),
  fieldLabels: z.optional(ContactFormFieldLabelsSchema),
});

const FeatureListSectionSchema = z.object({
  type: z.literal("feature-list"),
  title: z.string().min(1, "Feature list title is required."),
  description: z.optional(z.string().min(1, "Feature list description cannot be empty.")),
  items: z
    .array(
      TitleDescriptionItemSchema.extend({
        icon: z.optional(z.string().min(1, "Feature icon cannot be empty.")),
        image: z.optional(z.string().min(1, "Feature image cannot be empty.")),
        imageAlt: z.optional(z.string().min(1, "Feature imageAlt cannot be empty.")),
      }),
    )
    .min(1, "Feature list requires at least one item."),
});

const ImageTextSectionSchema = z.object({
  type: z.literal("image-text"),
  title: z.string().min(1, "Image text title is required."),
  description: z.string().min(1, "Image text description is required."),
  image: z.optional(z.string().min(1, "Image text image cannot be empty.")),
  imageAlt: z.optional(z.string().min(1, "Image text imageAlt cannot be empty.")),
  reverse: z.optional(z.boolean()),
  cta: z.optional(CtaSchema),
});

const CaseStudiesSectionSchema = z.object({
  type: z.literal("case-studies"),
  title: z.string().min(1, "Case studies title is required."),
  primaryCta: z.optional(CtaSchema),
  secondaryCta: z.optional(CtaSchema),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Case study title is required."),
        location: z.optional(z.string().min(1, "Case study location cannot be empty.")),
        industry: z.optional(z.string().min(1, "Case study industry cannot be empty.")),
        description: z.string().min(1, "Case study description is required."),
        image: z.optional(z.string().min(1, "Case study image cannot be empty.")),
      }),
    )
    .min(1, "Case studies requires at least one item."),
});

const ProcessStepsSectionSchema = z.object({
  type: z.literal("process-steps"),
  title: z.string().min(1, "Process steps title is required."),
  steps: z.array(TitleDescriptionItemSchema).min(1, "Process steps requires at least one step."),
});

const StatsSectionSchema = z.object({
  type: z.literal("stats"),
  intro: z.optional(z.string().min(1, "Stats intro cannot be empty.")),
  aboutCta: z.optional(CtaSchema),
  items: z
    .array(
      z.object({
        label: z.string().min(1, "Stat label is required."),
        value: z.string().min(1, "Stat value is required."),
        description: z.optional(z.string().min(1, "Stat description cannot be empty.")),
      }),
    )
    .min(1, "Stats requires at least one item."),
});

const FaqSectionSchema = z.object({
  type: z.literal("faq"),
  title: z.string().min(1, "FAQ title is required."),
  items: z
    .array(
      z.object({
        question: z.string().min(1, "FAQ question is required."),
        answer: z.string().min(1, "FAQ answer is required."),
      }),
    )
    .min(1, "FAQ requires at least one item."),
});

const CertificatesSectionSchema = z.object({
  type: z.literal("certificates"),
  title: z.string().min(1, "Certificates title is required."),
  items: z
    .array(
      z.object({
        title: z.string().min(1, "Certificate title is required."),
        image: z.optional(z.string().min(1, "Certificate image cannot be empty.")),
        description: z.optional(z.string().min(1, "Certificate description cannot be empty.")),
      }),
    )
    .min(1, "Certificates requires at least one item."),
});

const ContactChannelSchema = z.object({
  label: z.string().min(1, "Contact channel label is required."),
  value: z.string().min(1, "Contact channel value is required."),
  href: z.optional(z.string().min(1, "Contact channel href cannot be empty.")),
});

const ContactBlockSectionSchema = z.object({
  type: z.literal("contact-block"),
  title: z.string().min(1, "Contact block title is required."),
  description: z.string().min(1, "Contact block description is required."),
  channels: z.optional(z.array(ContactChannelSchema).min(1, "Contact block channels cannot be empty.")),
  cta: z.optional(CtaSchema),
});

export const SectionSchema = z.discriminatedUnion("type", [
  HeroSectionSchema,
  ServicesGridSectionSchema,
  GallerySectionSchema,
  ContactFormSectionSchema,
  FeatureListSectionSchema,
  ImageTextSectionSchema,
  CaseStudiesSectionSchema,
  ProcessStepsSectionSchema,
  StatsSectionSchema,
  FaqSectionSchema,
  CertificatesSectionSchema,
  ContactBlockSectionSchema,
]);

export const PageSchema = z.object({
  slug: PageSlugSchema,
  template: z.string().min(1, "Page template is required."),
  seo: z.object({
    title: z.string().min(1, "Page SEO title is required."),
    description: z.string().min(1, "Page SEO description is required."),
  }),
  sections: z.array(SectionSchema).min(1, "Page requires at least one section."),
});

export type Section = z.infer<typeof SectionSchema>;
export type PageContent = z.infer<typeof PageSchema>;
