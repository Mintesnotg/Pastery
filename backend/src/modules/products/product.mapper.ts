import type { Product, ProductCategory } from "@prisma/client";
import { toAuditableDto } from "../../shared/types/auditable.js";

export type ProductCategorySummaryDto = {
  id: number;
  name: string;
  description: string | null;
};

export type ProductPublicDto = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_special: boolean;
  category: ProductCategorySummaryDto;
};

export type ProductAdminDto = ProductPublicDto & {
  category_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

type ProductRow = Product & { category: ProductCategory };

export function toProductPublicDto(row: ProductRow): ProductPublicDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    image: row.image,
    is_special: row.isSpecial,
    category: {
      id: row.category.id,
      name: row.category.name,
      description: row.category.description,
    },
  };
}

export function toProductAdminDto(row: ProductRow): ProductAdminDto {
  return {
    ...toProductPublicDto(row),
    category_id: row.categoryId,
    ...toAuditableDto(row),
  };
}

export type ProductWriteInput = {
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: number;
  is_special?: boolean;
  is_active?: boolean;
};

export function toProductCreateInput(
  input: ProductWriteInput,
  actorId?: string | null,
): {
  name: string;
  description: string;
  price: number;
  image: string;
  isSpecial: boolean;
  active: boolean;
  category: { connect: { id: number } };
  createdByUser?: { connect: { id: string } };
  updatedByUser?: { connect: { id: string } };
} {
  return {
    name: input.name,
    description: input.description,
    price: input.price,
    image: input.image,
    isSpecial: input.is_special ?? false,
    active: input.is_active ?? true,
    category: { connect: { id: input.category_id } },
    ...(actorId
      ? {
          createdByUser: { connect: { id: actorId } },
          updatedByUser: { connect: { id: actorId } },
        }
      : {}),
  };
}

export function toProductUpdateInput(
  input: Partial<ProductWriteInput>,
  actorId?: string | null,
) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description;
  if (input.price !== undefined) data.price = input.price;
  if (input.image !== undefined) data.image = input.image;
  if (input.is_special !== undefined) data.isSpecial = input.is_special;
  if (input.is_active !== undefined) data.active = input.is_active;
  if (input.category_id !== undefined) data.category = { connect: { id: input.category_id } };
  if (actorId) data.updatedByUser = { connect: { id: actorId } };
  return data;
}
