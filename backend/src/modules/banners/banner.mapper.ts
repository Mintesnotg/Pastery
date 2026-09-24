import type { Banner } from "@prisma/client";

export type BannerPublicDto = {
  id: string;
  title: string;
  alt_text: string;
  image_url: string;
  cta: { label: string; link: string };
  overlay_text: { heading: string; subheading: string };
};

export type BannerAdminDto = BannerPublicDto & {
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function toBannerPublicDto(banner: Banner): BannerPublicDto {
  return {
    id: String(banner.id),
    title: banner.title,
    alt_text: banner.altText,
    image_url: banner.imageUrl,
    cta: { label: banner.ctaLabel, link: banner.ctaLink },
    overlay_text: { heading: banner.overlayHeading, subheading: banner.overlaySubheading },
  };
}

export function toBannerAdminDto(banner: Banner): BannerAdminDto {
  return {
    ...toBannerPublicDto(banner),
    is_active: banner.active,
    sort_order: banner.sortOrder,
    created_at: banner.createdAt.toISOString(),
    updated_at: banner.updatedAt.toISOString(),
  };
}

export type BannerWriteInput = {
  title: string;
  alt_text: string;
  image_url: string;
  cta: { label: string; link: string };
  overlay_text: { heading: string; subheading: string };
  is_active?: boolean;
  sort_order?: number;
};

export function toBannerCreateInput(input: BannerWriteInput) {
  return {
    title: input.title,
    altText: input.alt_text,
    imageUrl: input.image_url,
    ctaLabel: input.cta.label,
    ctaLink: input.cta.link,
    overlayHeading: input.overlay_text.heading,
    overlaySubheading: input.overlay_text.subheading,
    active: input.is_active ?? true,
    sortOrder: input.sort_order ?? 0,
  };
}

export function toBannerUpdateInput(input: Partial<BannerWriteInput>) {
  const data: Record<string, unknown> = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.alt_text !== undefined) data.altText = input.alt_text;
  if (input.image_url !== undefined) data.imageUrl = input.image_url;
  if (input.cta?.label !== undefined) data.ctaLabel = input.cta.label;
  if (input.cta?.link !== undefined) data.ctaLink = input.cta.link;
  if (input.overlay_text?.heading !== undefined) data.overlayHeading = input.overlay_text.heading;
  if (input.overlay_text?.subheading !== undefined) data.overlaySubheading = input.overlay_text.subheading;
  if (input.is_active !== undefined) data.active = input.is_active;
  if (input.sort_order !== undefined) data.sortOrder = input.sort_order;

  return data;
}
