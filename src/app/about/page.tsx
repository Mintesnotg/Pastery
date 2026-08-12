import Link from "next/link";
import { ChevronRight, Wheat, Heart, Award, Leaf, Users, Flame } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { BreadSlice } from "@/components/BreadSlice";

export const metadata = {
  title: "About Us",
};
   
const values = [
  { icon: Wheat, title: "Handcrafted", desc: "No machines shaping our loaves — every bake is shaped, scored and finished by hand." },
  { icon: Leaf, title: "Naturally Leavened", desc: "We use a live sourdough culture over instant yeast for depth, digestibility and shelf life." },
  { icon: Award, title: "Honest Ingredients", desc: "Stone-milled flour, real French butter and locally sourced produce. Nothing artificial." },
  { icon: Flame, title: "Baked in Batches", desc: "Small batches all day long mean fresh bread and pastries no matter when you arrive." },
];

const timeline = [
  { year: "2010", text: "Theo and Anna Price open a tiny shop-front bakery on Crown Lane with a single sourdough starter and a big oven." },
  { year: "2014", text: "Word spreads across North London; we win our first 'Best Artisan Bakery' local award." },
  { year: "2018", text: "We expand into full celebration cakes and our espresso bar, pairing coffee with bakes." },
  { year: "2022", text: "Our croissant takes first place in the London Pastry Prize — a quiet night of celebration." },
  { year: "Today", text: "A 14-strong team, ovens running from 4 AM, and the same small-batch philosophy that started it all." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        breadcrumb="About Us"
        title="Our Story, Dough & Blood"
        subtitle="House of Bread London is a family-run bakery built on slow ferments, real butter and a stubborn belief in things made properly."
      />

      {/* Founder story */}
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <img
              src="https://images.pexels.com/photos/5403020/pexels-photo-5403020.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1100"
              alt="Bakers at work kneading dough"
              className="rounded-3xl object-cover shadow-2xl"
            />
            <img
              src="https://images.pexels.com/photos/29380150/pexels-photo-29380150.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=500&w=800"
              alt="Cozy bakery shelves full of bread"
              className="-mt-20 ml-auto mr-4 w-64 rounded-2xl border-4 border-cream object-cover shadow-xl sm:w-80"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-crust/60">Est. 2010</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-crust-deep sm:text-4xl">
              A Shop-Front Dream on Crown Lane
            </h2>
            <BreadSlice className="mt-3 h-6 w-16 text-honey" />
            <p className="mt-4 text-lg leading-relaxed text-crust-deep/80">
              What began as Theo&apos;s Sunday hobby — experimenting with wild yeasts and stone-milled
              flour — became a neighbourhood bakery, then a London favourite. We&apos;re still the same
              at heart: we feed our culture twice a day, laminate croissants by hand, and greet every
              customer by name.
            </p>
            <p className="mt-4 text-crust-deep/80">
              Our mission is simple: bake better bread, support local growers, and make every person
              who walks through the door feel at home.
            </p>
            <div className="mt-6 flex gap-6">
              <div><p className="font-display text-3xl font-bold text-crust">14</p><p className="text-sm text-crust/70">Years baking</p></div>
              <div><p className="font-display text-3xl font-bold text-crust">4AM</p><p className="text-sm text-crust/70">Ovens on daily</p></div>
              <div><p className="font-display text-3xl font-bold text-crust">6</p><p className="text-sm text-crust/70">Awards won</p></div>
            </div>
            <Link href="/contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-crust px-6 py-3 font-semibold text-white transition hover:bg-crust-dark">
              Meet us in store <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-crust-deep py-16 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-honey">What we stand for</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Our Four Baking Truths</h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-honey text-crust-deep"><v.icon size={22} /></span>
                <h3 className="mt-4 font-display text-xl font-bold text-white">{v.title}</h3>
                <p className="mt-2 text-sm text-cream/70">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-crust/60">The journey</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-crust-deep sm:text-4xl">Milestones Along the Way</h2>
            <BreadSlice className="mx-auto mt-3 h-6 w-16 text-honey" />
          </div>
          <div className="mt-10 space-y-8">
            {timeline.map((t) => (
              <div key={t.year} className="relative flex gap-5 border-l-2 border-dough pl-6">
                <span className="absolute -left-3 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-crust bg-cream">
                  <Heart size={10} className="text-crust" />
                </span>
                <div>
                  <p className="font-display text-2xl font-bold text-crust">{t.year}</p>
                  <p className="mt-1 text-crust-deep/80">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team strip */}
      <section className="bg-warm py-14">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-crust"><Users size={22} /></span>
          <h2 className="mt-4 font-display text-3xl font-bold text-crust-deep">Meet the Team</h2>
          <p className="mx-auto mt-3 max-w-2xl text-crust-deep/70">
            From our head baker to the friendly faces at the counter, our team of 14 makes the magic
            happen every single morning — starting at 4 AM.
          </p>
          <Link href="/order" className="mt-7 inline-flex items-center gap-2 rounded-full bg-crust px-7 py-3.5 font-semibold text-white transition hover:bg-crust-dark">
            Try Our Bakes <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
