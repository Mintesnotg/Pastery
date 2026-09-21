import { listProducts } from "./product.repository.js";

export async function getProducts() {
  return listProducts();
}
