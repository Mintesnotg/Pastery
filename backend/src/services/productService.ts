import { listProducts } from "../repositories/productRepository.js";

export async function getProducts() {
  return listProducts();
}
