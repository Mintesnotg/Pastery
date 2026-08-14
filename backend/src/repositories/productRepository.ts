import { desc } from "drizzle-orm";
import { products } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const productRepository = createGenericRepository(products, products.id);

export async function listProducts() {
  return productRepository.findMany({ orderBy: desc(products.createdAt) });
}

export const findProductById = productRepository.findById;
export const createProduct = productRepository.create;
export const updateProductById = productRepository.updateById;
export const deleteProductById = productRepository.deleteById;
