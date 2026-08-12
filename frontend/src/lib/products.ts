import { fallbackProducts, type ProductItem } from "@/data/products";
import { apiUrl } from "@/lib/api";

export async function getProducts(): Promise<ProductItem[]> {
  try {
    const res = await fetch(apiUrl("/api/products"), { cache: "no-store" });
    if (res.ok) {
      const rows = await res.json();
      return rows.map((r: any) => ({
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
    console.warn("Backend fetch failed, using fallback data:", (e as Error).message);
  }
  return fallbackProducts;
}

export function getFeatured(productsList: ProductItem[]) {
  const featured = productsList.filter((p) => p.featured);
  return featured.length > 0 ? featured : productsList.slice(0, 4);
}
