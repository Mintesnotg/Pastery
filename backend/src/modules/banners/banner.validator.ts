import { z } from "zod";

const bannerCtaSchema = z.object({
  label: z.string().min(1),
  link: z.string().min(1),
});

const bannerOverlaySchema = z.object({
  heading: z.string().min(1),
  subheading: z.string().min(1),
});

export const bannerCreateSchema = z.object({
  title: z.string().min(1),
  alt_text: z.string().min(1),
  image_url: z.string().url(),
  cta: bannerCtaSchema,
  overlay_text: bannerOverlaySchema,
  is_active: z.boolean().optional().default(true),
  sort_order: z.number().int().optional().default(0),
});

export const bannerUpdateSchema = bannerCreateSchema.partial();
