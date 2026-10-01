import type { ProductCategory } from "@prisma/client";
import { toAuditableDto } from "../../shared/types/auditable.js";

export type ProductCategoryPublicDto = {
  id: number;
  name: string;
  description: string | null;
};

export type ProductCategoryAdminDto = ProductCategoryPublicDto & {
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export function toCategoryPublicDto(row: ProductCategory): ProductCategoryPublicDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
  };
}

export function toCategoryAdminDto(row: ProductCategory): ProductCategoryAdminDto {
  return {
    ...toCategoryPublicDto(row),
    ...toAuditableDto(row),
  };
}

export type CategoryWriteInput = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export function toCategoryCreateInput(
  input: CategoryWriteInput,
  actorId?: string | null,
) {
  return {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    active: input.is_active ?? true,
    ...(actorId
      ? {
          createdByUser: { connect: { id: actorId } },
          updatedByUser: { connect: { id: actorId } },
        }
      : {}),
  };
}

export function toCategoryUpdateInput(
  input: Partial<CategoryWriteInput>,
  actorId?: string | null,
) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.is_active !== undefined) data.active = input.is_active;
  if (actorId) data.updatedByUser = { connect: { id: actorId } };
  return data;
}
