"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingBasket } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import type { StoreProduct } from "@/lib/products";

type Props = {
  products: StoreProduct[];
};

const GAP = 24;

function getVisibleCount(track: HTMLDivElement, card: HTMLElement) {
  return Math.max(1, Math.round(track.clientWidth / (card.offsetWidth + GAP)));
}

function getPageWidth(track: HTMLDivElement, card: HTMLElement) {
  return (card.offsetWidth + GAP) * getVisibleCount(track, card);
}

export function FeaturedBakesCarousel({ products }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const { toast, showToast, dismiss } = useToast();
  const { addToCart } = useCart();

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

  if (products.length === 0) return null;

  return (
    <section className="bg-[#5C4030] py-16 text-cream">
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-[#D4A84B] uppercase">Favourites</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#F5E6D3] sm:text-4xl">
              Our Featured Bakes
            </h2>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-[#F5E6D3] transition hover:bg-white/10"
              aria-label="Previous featured bakes"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-[#F5E6D3] transition hover:bg-white/10"
              aria-label="Next featured bakes"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <article
              key={p.id}
              data-card
              className="flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white shadow-lg sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                <span className="absolute top-3 left-3 rounded-full bg-[#FDEBDD] px-3 py-1 text-xs font-semibold text-[#734F32]">
                  {p.category.name}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold text-[#3F2A18]">{p.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#6B5648]">{p.description}</p>
                <p className="mt-3 font-display text-lg font-semibold text-[#3F2A18]">
                  £{p.price.toFixed(2)}
                </p>
                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(p);
                      showToast(`${p.name} added to your basket.`, "success");
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FDEBDD] py-3 text-sm font-semibold text-[#734F32] transition hover:brightness-95"
                  >
                    <ShoppingBasket size={16} />
                    Order
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === page ? "true" : undefined}
              className={`h-2.5 cursor-pointer rounded-full transition ${
                i === page ? "w-6 bg-[#D4A84B]" : "w-2.5 bg-[#3F2A18]/40 hover:bg-[#3F2A18]/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
