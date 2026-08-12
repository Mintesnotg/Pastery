import Link from "next/link";
import { Wheat } from "lucide-react";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-honey to-crust text-white shadow-md transition-transform group-hover:rotate-12">
        <Wheat size={20} strokeWidth={2.2} />
      </span>
      <span className="leading-tight">
        <span className={`block font-display text-lg font-bold ${dark ? "text-white" : "text-crust-deep"}`}>
          House of Bread
        </span>
        <span className={`block text-[11px] font-medium tracking-[0.25em] uppercase ${dark ? "text-cream/70" : "text-crust"}`}>
          London · Est. 2010
        </span>
      </span>
    </Link>
  );
}
