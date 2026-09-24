"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingBasket,
  CheckCircle2,
  Loader2,
  Croissant,
} from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { apiUrl } from "@/lib/api";
import type { StoreProduct } from "@/lib/products";

type Category = { id: number; name: string; description: string | null };

type Props = {
  products: StoreProduct[];
  categories: Category[];
};

export default function OrderPage({ products, categories }: Props) {
  const { cart, addToCart, changeQty, removeItem, clearCart, total, itemCount } = useCart();
  const { toast, showToast, dismiss } = useToast();
  const [activeCategoryId, setActiveCategoryId] = useState<number | "all">("all");
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState({
    customerName: "",
    email: "",
    phone: "",
    pickupDate: "",
    pickupTime: "",
    notes: "",
  });

  const visible = useMemo(
    () =>
      activeCategoryId === "all"
        ? products
        : products.filter((p) => p.category.id === activeCategoryId),
    [products, activeCategoryId],
  );

  const handleAdd = (product: StoreProduct) => {
    addToCart(product);
    showToast(`${product.name} added to your basket.`, "success");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...details,
          items: cart.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            qty: i.qty,
          })),
          total: Number(total.toFixed(2)),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setPlaced(true);
      clearCart();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="rounded-3xl border border-crust/10 bg-white p-10 shadow-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={34} />
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-crust-deep">
            Order Confirmed!
          </h1>
          <p className="mt-3 text-crust-deep/70">
            Thank you for ordering with House of Bread London. We&apos;ll have everything baked
            fresh and ready for your pick-up at{" "}
            <span className="font-semibold">
              {details.pickupDate} at {details.pickupTime}
            </span>{" "}
            — pay at the counter. See you soon!
          </p>
          <button
            type="button"
            onClick={() => setPlaced(false)}
            className="mt-7 cursor-pointer rounded-full bg-crust px-7 py-3 font-semibold text-white transition hover:bg-crust-dark"
          >
            Make Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="lg:col-span-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategoryId("all")}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategoryId === "all"
                ? "bg-crust text-white"
                : "bg-white text-crust-deep hover:bg-warm"
            }`}
          >
            All Bakes
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategoryId(c.id)}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategoryId === c.id
                  ? "bg-crust text-white"
                  : "bg-white text-crust-deep hover:bg-warm"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {visible.map((p) => (
            <div
              key={p.id}
              className="group flex gap-4 overflow-hidden rounded-2xl border border-crust/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-crust">
                  {p.category.name}
                </span>
                <h3 className="font-display font-bold text-crust-deep">{p.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-crust-deep/60">{p.description}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-bold text-crust-dark">£{p.price.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => handleAdd(p)}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-crust text-white transition hover:bg-crust-dark"
                    aria-label={`Add ${p.name}`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="mt-8 text-center text-sm text-crust/60">No products in this category yet.</p>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col rounded-3xl border border-crust/10 bg-white p-6 shadow-sm">
          <div className="flex shrink-0 items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-crust-deep">
              <ShoppingBasket size={20} className="text-crust" /> Your Order
            </h2>
            <span className="rounded-full bg-warm px-3 py-1 text-sm font-bold text-crust">
              {itemCount}
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-crust/20 p-8 text-center text-sm text-crust/60">
              <Croissant size={30} className="mx-auto mb-2 text-crust/40" />
              Your basket is empty. Add some fresh bakes to get started.
            </div>
          ) : (
            <>
              <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {cart.map((i) => (
                  <div
                    key={i.product.id}
                    className="flex items-center gap-3 rounded-xl bg-cream/60 p-2.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={i.product.image}
                      alt={i.product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-crust-deep">
                        {i.product.name}
                      </p>
                      <p className="text-xs text-crust/60">£{i.product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => changeQty(i.product.id, -1)}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-crust shadow-sm"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{i.qty}</span>
                      <button
                        type="button"
                        onClick={() => changeQty(i.product.id, 1)}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-crust shadow-sm"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(i.product.id)}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                      aria-label="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex shrink-0 items-center justify-between border-t border-crust/10 pt-3">
                <span className="font-medium text-crust-deep">Total</span>
                <span className="text-xl font-bold text-crust-dark">£{total.toFixed(2)}</span>
              </div>
            </>
          )}

          {cart.length > 0 && (
            <form onSubmit={handleSubmit} className="mt-5 shrink-0 space-y-3">
              <input
                required
                value={details.customerName}
                onChange={(e) => setDetails({ ...details, customerName: e.target.value })}
                placeholder="Full name *"
                className="w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-2.5 text-sm outline-none focus:border-crust"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  type="email"
                  value={details.email}
                  onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  placeholder="Email *"
                  className="w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-2.5 text-sm outline-none focus:border-crust"
                />
                <input
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-2.5 text-sm outline-none focus:border-crust"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  type="date"
                  value={details.pickupDate}
                  onChange={(e) => setDetails({ ...details, pickupDate: e.target.value })}
                  className="w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-2.5 text-sm outline-none focus:border-crust"
                />
                <input
                  required
                  type="time"
                  value={details.pickupTime}
                  onChange={(e) => setDetails({ ...details, pickupTime: e.target.value })}
                  className="w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-2.5 text-sm outline-none focus:border-crust"
                />
              </div>
              <textarea
                rows={2}
                value={details.notes}
                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                placeholder="Special requests (optional)"
                className="w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-2.5 text-sm outline-none focus:border-crust"
              />
              {error && <p className="text-sm font-medium text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-crust py-3 font-semibold text-white transition hover:bg-crust-dark disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {submitting ? "Placing order…" : `Place Order · £${total.toFixed(2)}`}
              </button>
              <p className="text-center text-xs text-crust/60">
                Pay when you collect. We bake to order for guaranteed freshness.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
