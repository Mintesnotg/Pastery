import Link from "next/link";
import { ChevronRight, Store, Croissant, Soup } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { getProducts, toProductItem } from "@/lib/products";
import { PRODUCT_CATEGORIES } from "@/data/products";

export const dynamic = "force-dynamic";

export default async function BreadPastriesPage() {
  const products = await getProducts();
  const bread = products.filter((p) => /bread/i.test(p.category.name)).map(toProductItem);
  const pastries = products.filter((p) => /pastr/i.test(p.category.name)).map(toProductItem);
  const cookies = products.filter((p) => /cookie/i.test(p.category.name)).map(toProductItem);

  return (
    <>
      <PageHeader
        breadcrumb="Bread & Pastries"
        title="Baked at Dawn, Gone by Lunch"
        subtitle="Naturally leavened sourdough, rustic loaves and flaky French-style pastries — all made in small batches, every day."
      />

      {/* Bread */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm text-crust"><Soup size={20} /></span>
            <div>
              <h2 className="font-display text-2xl font-bold text-crust-deep sm:text-3xl">Artisan Bread</h2>
              <p className="text-sm text-crust/70">Slow-fermented, stone-milled, hand-shaped.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bread.map((p) => (
              <ProductCard key={p.id} product={p} showAddButton />
            ))}
          </div>
        </div>
      </section>

      {/* Pastries */}
      <section className="bg-warm py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-crust"><Croissant size={20} /></span>
            <div>
              <h2 className="font-display text-2xl font-bold text-crust-deep sm:text-3xl">Pastries & Viennoiserie</h2>
              <p className="text-sm text-crust/70">Laminated with real French butter for that perfect flake.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pastries.map((p) => (
              <ProductCard key={p.id} product={p} showAddButton />
            ))}
          </div>
        </div>
      </section>

      {/* Cookies */}
      {cookies.length > 0 && (
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm text-crust">🍪</span>
              <div>
                <h2 className="font-display text-2xl font-bold text-crust-deep sm:text-3xl">Cookies & Treats</h2>
                <p className="text-sm text-crust/70">Baked through the day while stocks last.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cookies.map((p) => (
                <ProductCard key={p.id} product={p} showAddButton />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-crust-deep p-8 text-cream">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-honey text-crust-deep"><Store size={22} /></span>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Running low at the shop?</h3>
                <p className="text-cream/70">Reserve fresh bakes for pick-up and skip the queue.</p>
              </div>
            </div>
            <Link href="/order" className="inline-flex items-center gap-2 rounded-full bg-honey px-7 py-3.5 font-semibold text-crust-deep transition hover:brightness-95">
              Order Online <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
