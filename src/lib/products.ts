import { db } from "@/db";
import { products } from "@/db/schema";
import { fallbackProducts, type ProductItem } from "@/data/products";

export async function getProducts(): Promise<ProductItem[]> {
  try {
    const rows = await db.select().from(products);
    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        description: r.description,
        price: Number(r.price),
        image: r.image,
        featured: r.featured,
        tags: r.tags,
      }));
    }
  } catch (e) {
    console.warn("DB fetch failed, using fallback data:", (e as Error).message);
  }
  return fallbackProducts;
}

export function getFeatured(productsList: ProductItem[]) {
  const featured = productsList.filter((p) => p.featured);
  return featured.length > 0 ? featured : productsList.slice(0, 4);
}
