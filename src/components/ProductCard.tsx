"use client";

import { ShoppingBasket, Star } from "lucide-react";
import { useState } from "react";
import type { ProductItem } from "@/data/products";

export default function ProductCard({
  product,
  showAddButton = false,
  onAdd,
}: {
  product: ProductItem;
  showAddButton?: boolean;
  onAdd?: (p: ProductItem) => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd?.(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-crust/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-berry px-2.5 py-1 text-xs font-bold text-white shadow">
            <Star size={12} className="fill-white" /> Bestseller
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-crust">
          {product.category}
        </span>
        <h3 className="mt-1 font-display text-lg font-bold text-crust-deep">{product.name}</h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-crust-deep/70">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-crust-dark">
            £{product.price.toFixed(2)}
          </span>
          {showAddButton || onAdd ? (
            <button
              onClick={handleAdd}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-crust text-white hover:bg-crust-dark"
              }`}
            >
              {added ? (
                <>
                  <span>Added</span> ✓
                </>
              ) : (
                <>
                  <ShoppingBasket size={15} /> Add
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
