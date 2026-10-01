"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Cake,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Cookie,
  Croissant,
  Wheat,
} from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { apiUrl } from "@/lib/api";
import type { StoreProduct } from "@/lib/products";

type Category = { id: number; name: string; description: string | null };

type Props = {
  initialProducts: StoreProduct[];
  categories: Category[];
};

const GAP = 24;

const CATEGORY_LOOK: Record<
  string,
  { gradient: string; Icon: typeof Cake }
> = {
  Cakes: { gradient: "from-[#BC7A5C] to-[#8B4D3E]", Icon: Cake },
  Breads: { gradient: "from-[#C49A6C] to-[#8B5E3C]", Icon: Wheat },
  Pastries: { gradient: "from-[#D4A574] to-[#A66B3F]", Icon: Croissant },
  Cookies: { gradient: "from-[#C98B5E] to-[#8F5A3A]", Icon: Cookie },
  Drinks: { gradient: "from-[#A67C52] to-[#6B4423]", Icon: Coffee },
};

function lookFor(name: string) {
  return CATEGORY_LOOK[name] ?? { gradient: "from-[#BC7A5C] to-[#8B4D3E]", Icon: Cake };
}

function getVisibleCount(track: HTMLDivElement, card: HTMLElement) {
  return Math.max(1, Math.round(track.clientWidth / (card.offsetWidth + GAP)));
}

function getPageWidth(track: HTMLDivElement, card: HTMLElement) {
  return (card.offsetWidth + GAP) * Math.min(4, getVisibleCount(track, card));
}

export function MoreFromCounter({ initialProducts, categories }: Props) {
  const [activeId, setActiveId] = useState<number | "all">("all");
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const { toast, showToast, dismiss } = useToast();
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async (categoryId: number | "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryId !== "all") params.set("categoryId", String(categoryId));
      const qs = params.toString();
      const res = await fetch(apiUrl(`/api/products${qs ? `?${qs}` : ""}`), { cache: "no-store" });
      if (res.ok) {
        const rows = await res.json();
        setProducts(
          rows.map((r: {
            id: number;
            name: string;
            description: string;
            price: number;
            image: string;
            is_special: boolean;
            category: Category;
          }) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            price: Number(r.price),
            image: r.image,
            isSpecial: r.is_special,
            category: r.category,
          })),
        );
        trackRef.current?.scrollTo({ left: 0 });
        setPage(0);
      }
    } finally {
      setTimeout(() => setLoading(false), 350);
    }
  }, []);

  const onTab = (id: number | "all") => {
    setActiveId(id);
    void fetchProducts(id);
  };

  const updatePages = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) {
      setPageCount(1);
      return;
    }
    setPageCount(Math.max(1, Math.ceil(products.length / getVisibleCount(el, card))));
  }, [products.length]);

  useEffect(() => {
    updatePages();
    window.addEventListener("resize", updatePages);
    return () => window.removeEventListener("resize", updatePages);
  }, [updatePages]);

  const scrollByCards = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    el.scrollBy({ left: dir * getPageWidth(el, card), behavior: "smooth" });
  };

  const goToPage = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    el.scrollTo({ left: index * getPageWidth(el, card), behavior: "smooth" });
    setPage(index);
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const pageWidth = getPageWidth(el, card);
    if (pageWidth <= 0) {
      setPage(0);
      return;
    }
    setPage(Math.min(pageCount - 1, Math.round(el.scrollLeft / pageWidth)));
  };

  return (
    <section className="bg-[#FAF6F1] py-16">
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.28em] text-[#C68E56] uppercase">Fresh Daily</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[#3C2A21] sm:text-4xl">
            More From Our Counter
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#6B5648] sm:text-base">
            Everyday favorites, baked fresh each morning and ready whenever you are.
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#3C2A21] p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => onTab("all")}
              className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeId === "all"
                  ? "bg-[#C68E56] text-white"
                  : "text-white/75 hover:text-white"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onTab(c.id)}
                className={`shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeId === c.id
                    ? "bg-[#C68E56] text-white"
                    : "text-white/75 hover:text-white"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3 lg:gap-4">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className="hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition hover:bg-[#F5EDE4] lg:flex"
            aria-label="Previous products"
          >
            <ChevronLeft size={18} className="text-[#3C2A21]" />
          </button>

          <div
            ref={trackRef}
            onScroll={onScroll}
            className="min-w-0 flex-1 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    data-card
                    className="w-[82%] shrink-0 snap-start overflow-hidden rounded-3xl border border-[#E8DDD2] bg-white sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                  >
                    <div className="aspect-[5/4] animate-pulse bg-[#E8DDD2]" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-2/3 animate-pulse rounded bg-[#E8DDD2]" />
                      <div className="h-4 w-full animate-pulse rounded bg-[#F0E7DE]" />
                      <div className="h-9 w-full animate-pulse rounded-full bg-[#E8DDD2]" />
                    </div>
                  </div>
                ))
              : products.map((p) => {
                  const look = lookFor(p.category.name);
                  const Icon = look.Icon;
                  return (
                    <article
                      key={p.id}
                      data-card
                      className="flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-[#E8DDD2] bg-white shadow-sm sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
                    >
                      <div
                        className={`relative flex aspect-[5/4] items-center justify-center bg-gradient-to-b ${look.gradient}`}
                      >
                        <span className="absolute top-3 left-3 rounded-full bg-[#3C2A21] px-3 py-1 text-xs font-semibold text-white">
                          {p.category.name}
                        </span>
                        <Icon className="h-14 w-14 text-white/90" strokeWidth={1.25} />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-lg font-semibold text-[#3C2A21]">{p.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-[#6B5648]">{p.description}</p>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                          <p className="font-display text-lg font-bold text-[#3C2A21]">
                            £{p.price.toFixed(2)}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(p);
                              showToast("Item added to your cart", "success");
                            }}
                            className="cursor-pointer rounded-full bg-[#3C2A21] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2A1D16]"
                          >
                            Order now
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
          </div>

          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className="hidden h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white shadow-md transition hover:bg-[#F5EDE4] lg:flex"
            aria-label="Next products"
          >
            <ChevronRight size={18} className="text-[#3C2A21]" />
          </button>
        </div>

        {!loading && products.length === 0 && (
          <p className="mt-6 text-center text-sm text-[#6B5648]">No products in this category yet.</p>
        )}

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              className={`h-2.5 cursor-pointer rounded-full transition ${
                i === page ? "w-6 bg-[#3C2A21]" : "w-2.5 bg-[#D9C8B8] hover:bg-[#C4B3A0]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
