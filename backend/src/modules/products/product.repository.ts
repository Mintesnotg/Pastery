import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

export async function listProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
}

export const findProductById = (id: number) => prisma.product.findUnique({ where: { id } });
export const createProduct = (data: Prisma.ProductCreateInput) => prisma.product.create({ data });
export const updateProductById = (id: number, data: Prisma.ProductUpdateInput) =>
  prisma.product.update({ where: { id }, data }).catch(() => null);
export const deleteProductById = (id: number) =>
  prisma.product.delete({ where: { id } }).catch(() => null);
