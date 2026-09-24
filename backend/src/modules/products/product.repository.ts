import type { Product, ProductCategory, Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

export type ProductWithCategory = Product & { category: ProductCategory };

const categoryInclude = { category: true } as const;

export function listPublicProducts(filters: {
  isSpecial?: boolean;
  categoryId?: number;
  categoryName?: string;
}) {
  const where: Prisma.ProductWhereInput = { active: true };
  if (filters.isSpecial !== undefined) where.isSpecial = filters.isSpecial;
  if (filters.categoryId !== undefined) where.categoryId = filters.categoryId;
  if (filters.categoryName) {
    where.category = { name: { equals: filters.categoryName, mode: "insensitive" } };
  }
  return prisma.product.findMany({
    where,
    include: categoryInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function listAdminProducts(options: {
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
  search?: string;
}) {
  const where: Prisma.ProductWhereInput = {};
  if (!options.includeInactive) where.active = true;
  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  return prisma.product.findMany({
    where,
    include: categoryInclude,
    orderBy: { createdAt: "desc" },
    take: options.limit,
    skip: options.offset,
  });
}

export function countAdminProducts(options: { includeInactive?: boolean; search?: string } = {}) {
  const where: Prisma.ProductWhereInput = {};
  if (!options.includeInactive) where.active = true;
  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  return prisma.product.count({ where });
}

export function findProductById(id: number) {
  return prisma.product.findUnique({ where: { id }, include: categoryInclude });
}

export function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data, include: categoryInclude });
}

export function updateProductById(id: number, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({ where: { id }, data, include: categoryInclude }).catch(() => null);
}

export function deactivateProductById(id: number, updatedBy?: string | null) {
  return updateProductById(id, {
    active: false,
    ...(updatedBy
      ? { updatedByUser: { connect: { id: updatedBy } } }
      : {}),
  });
}
