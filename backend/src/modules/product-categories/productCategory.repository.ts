import type { Prisma, ProductCategory } from "@prisma/client";
import { prisma } from "../../db/index.js";

export function listActiveCategories() {
  return prisma.productCategory.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
}

export function listAdminCategories(options: {
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
  search?: string;
} = {}) {
  const where: Prisma.ProductCategoryWhereInput = {};
  if (!options.includeInactive) where.active = true;
  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  return prisma.productCategory.findMany({
    where,
    orderBy: { name: "asc" },
    take: options.limit,
    skip: options.offset,
  });
}

export function countAdminCategories(options: { includeInactive?: boolean; search?: string } = {}) {
  const where: Prisma.ProductCategoryWhereInput = {};
  if (!options.includeInactive) where.active = true;
  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  return prisma.productCategory.count({ where });
}

export function findCategoryById(id: number) {
  return prisma.productCategory.findUnique({ where: { id } });
}

export function createCategory(data: Prisma.ProductCategoryCreateInput) {
  return prisma.productCategory.create({ data });
}

export function updateCategoryById(id: number, data: Prisma.ProductCategoryUpdateInput) {
  return prisma.productCategory.update({ where: { id }, data }).catch(() => null);
}

export function deactivateCategoryById(id: number, updatedBy?: string | null) {
  return updateCategoryById(id, {
    active: false,
    ...(updatedBy ? { updatedByUser: { connect: { id: updatedBy } } } : {}),
  });
}

export type { ProductCategory };
