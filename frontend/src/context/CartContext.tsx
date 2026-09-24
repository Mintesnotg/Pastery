"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { StoreProduct } from "@/lib/products";

export type CartItem = { product: StoreProduct; qty: number };

type CartContextValue = {
  cart: CartItem[];
  addToCart: (product: StoreProduct) => void;
  changeQty: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  hydrated: boolean;
};

const STORAGE_KEY = "hob.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        item.product &&
        typeof item.product.id === "number" &&
        typeof item.qty === "number" &&
        item.qty > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore quota / private mode */
    }
  }, [cart, hydrated]);

  const addToCart = useCallback((product: StoreProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [cart],
  );

  const itemCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.qty, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      changeQty,
      removeItem,
      clearCart,
      total,
      itemCount,
      hydrated,
    }),
    [cart, addToCart, changeQty, removeItem, clearCart, total, itemCount, hydrated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
