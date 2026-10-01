"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBasket, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { navLinks } from "@/config/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-crust/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo priority />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) =>
            link.cta ? (
              <Link
                key={link.href}
                href={link.href}
                className="ml-2 inline-flex items-center gap-2 rounded-full bg-crust px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-crust-dark"
              >
                <ShoppingBasket size={16} />
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  pathname === link.href
                    ? "text-honey"
                    : "text-crust-deep hover:bg-warm hover:text-crust-dark"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <button
          className="inline-flex items-center justify-center rounded-lg p-2 text-crust-deep hover:bg-warm lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-crust/10 bg-cream px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  pathname === link.href
                    ? "bg-warm text-honey"
                    : "text-crust-deep hover:bg-warm"
                }`}
              >
                {link.label}
                {link.cta && <ShoppingBasket size={18} className="text-crust" />}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
