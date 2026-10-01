import Link from "next/link";
import { ChevronRight, Cake, Gift, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ProductCard from "@/components/ProductCard";
import { getProducts, toProductItem } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function CakesDessertsPage() {
  const products = await getProducts();
  const cakes = products.filter((p) => /cake|dessert/i.test(p.category.name)).map(toProductItem);

  return (
    <>
      <PageHeader
        breadcrumb="Cakes & Desserts"
        title="Cakes Worth Celebrating"
        subtitle="From delicate slices in the cabinet to fully bespoke celebration cakes, every layer is baked with the same dedication."
      />

      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm text-crust"><Cake size={20} /></span>
            <div>
              <h2 className="font-display text-2xl font-bold text-crust-deep sm:text-3xl">Our Cake Cabinet</h2>
              <p className="text-sm text-crust/70">Cakes by the slice and made-to-order whole cakes.</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cakes.map((p) => (
              <ProductCard key={p.id} product={p} showAddButton />
            ))}
          </div>
        </div>
      </section>

      {/* Bespoke section */}
      <section className="bg-warm py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="overflow-hidden rounded-3xl shadow-xl">
            <img
              src="https://images.pexels.com/photos/30233153/pexels-photo-30233153.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1000"
              alt="Elegant bespoke celebration cake"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-crust"><Gift size={14} /> Bespoke & Custom</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-crust-deep sm:text-4xl">Your Cake, Your Way</h2>
            <BreadSliceDecor />
            <p className="mt-4 text-crust-deep/80">
              Weddings, birthdays, baby showers or "just because" — our bakers will design a cake
              that&apos;s as beautiful as your moment. We recommend ordering at least 5 days ahead.
            </p>
            <ul className="mt-5 space-y-2 text-crust-deep/80">
              <li className="flex items-center gap-2"><span className="text-honey">✓</span> Free tasting sessions for wedding orders</li>
              <li className="flex items-center gap-2"><span className="text-honey">✓</span> Dietary options: gluten-free, vegan, nut-free</li>
              <li className="flex items-center gap-2"><span className="text-honey">✓</span> Store pickup or local London delivery</li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-crust px-6 py-3 font-semibold text-white transition hover:bg-crust-dark">
                Request a Custom Cake <ChevronRight size={18} />
              </Link>
              <Link href="/order" className="inline-flex items-center gap-2 rounded-full border-2 border-crust px-6 py-3 font-semibold text-crust transition hover:bg-crust hover:text-white">
                See All Treats
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-crust/70">
              <Phone size={15} /> Prefer to chat? Call +44 20 7946 0958
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h3 className="font-display text-2xl font-bold text-crust-deep">Made fresh to order</h3>
          <p className="mt-2 text-crust-deep/70">
            Whole cakes are baked to order for the freshest result. Give us 48 hours&apos; notice for
            the cabinet classics, and 5+ days for bespoke creations.
          </p>
        </div>
      </section>
    </>
  );
}

function BreadSliceDecor() {
  return (
    <svg viewBox="0 0 80 32" fill="none" aria-hidden="true" className="mx-0 mt-3 h-6 w-16 text-honey">
      <path d="M10 6c0-3 3-5 7-5h46c4 0 7 2 7 5 6 8 6 20 0 24H10C4 26 4 14 10 6z" fill="#e8d5b7" />
      <rect x="14" y="14" width="52" height="14" rx="2" fill="#faf6ef" />
      <circle cx="30" cy="21" r="2" fill="#d9a441" />
      <circle cx="50" cy="21" r="2" fill="#d9a441" />
    </svg>
  );
}
