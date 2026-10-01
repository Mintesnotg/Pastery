import Link from "next/link";
import LogoMark from "./LogoMark";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <LogoMark
        size={40}
        className="shrink-0 rounded-full shadow-md transition-transform group-hover:scale-105"
      />
      <span className="leading-tight">
        <span className={`block font-display text-lg font-bold ${dark ? "text-white" : "text-crust-deep"}`}>
          House of Bread
        </span>
        <span className={`block text-[11px] font-medium tracking-[0.25em] uppercase ${dark ? "text-honey" : "text-crust"}`}>
          London · Est. 2010
        </span>
      </span>
    </Link>
  );
}
