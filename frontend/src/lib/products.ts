import { fallbackProducts, type ProductItem } from "@/data/products";
import { apiUrl } from "@/lib/api";

export type StoreProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isSpecial: boolean;
  category: { id: number; name: string; description: string | null };
};

function mapApiProduct(r: {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_special: boolean;
  category: { id: number; name: string; description: string | null };
}): StoreProduct {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    image: r.image,
    isSpecial: Boolean(r.is_special),
    category: r.category,
  };
}

export function toProductItem(p: StoreProduct): ProductItem {
  return {
    id: p.id,
    name: p.name,
    category: p.category.name,
    description: p.description,
    price: p.price,
    image: p.image,
    featured: p.isSpecial,
    isSpecial: p.isSpecial,
  };
}

export async function getProducts(query: {
  isSpecial?: boolean;
  categoryId?: number;
  category?: string;
} = {}): Promise<StoreProduct[]> {
  try {
    const params = new URLSearchParams();
    if (query.isSpecial !== undefined) params.set("isSpecial", String(query.isSpecial));
    if (query.categoryId !== undefined) params.set("categoryId", String(query.categoryId));
    if (query.category) params.set("category", query.category);
    const qs = params.toString();
    const res = await fetch(apiUrl(`/api/products${qs ? `?${qs}` : ""}`), { cache: "no-store" });
    if (res.ok) {
      const rows = await res.json();
      return (rows as Parameters<typeof mapApiProduct>[0][]).map(mapApiProduct);
    }
  } catch (e) {
    console.warn("Backend fetch failed, using fallback data:", (e as Error).message);
  }
  return fallbackProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    isSpecial: p.featured,
    category: { id: 0, name: p.category, description: null },
  }));
}

export async function getProductCategories(): Promise<
  { id: number; name: string; description: string | null }[]
> {
  try {
    const res = await fetch(apiUrl("/api/product-categories"), { cache: "no-store" });
    if (res.ok) return res.json();
  } catch {
    /* ignore */
  }
  return [
    { id: 1, name: "Cakes", description: null },
    { id: 2, name: "Breads", description: null },
    { id: 3, name: "Pastries", description: null },
    { id: 4, name: "Cookies", description: null },
    { id: 5, name: "Drinks", description: null },
  ];
}
