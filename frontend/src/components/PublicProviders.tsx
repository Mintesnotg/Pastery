"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";

export function PublicProviders({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
