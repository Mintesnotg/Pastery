import type { ReactNode } from "react";
import { BreadSlice } from "./BreadSlice";

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  children,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-gradient-to-b from-warm to-cream py-14">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {breadcrumb && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-crust/60">
            {breadcrumb}
          </p>
        )}
        <BreadSlice />
        <h1 className="font-display text-4xl font-bold text-crust-deep sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-crust-deep/70">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
