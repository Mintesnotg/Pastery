import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Star,
  Wheat,
  Clock,
  Award,
  Leaf,
  Heart,
  Soup,
  Sparkles,
} from "lucide-react";
import { getProducts, getProductCategories } from "@/lib/products";
import { CONTACT_INFO, GALLERY_IMAGES } from "@/data/products";
import { BreadSlice } from "@/components/BreadSlice";
import { HomepageBanner, type BannerImage } from "@/components/HomepageBanner";
import { FeaturedBakesCarousel } from "@/components/home/FeaturedBakesCarousel";
import { MoreFromCounter } from "@/components/home/MoreFromCounter";
import { apiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

// Local static today's bakes (kept in page to reduce coupling)
const todayBakes = [
  { name: "Rye + Seed Sourdough", time: "Fresh at 8 AM", tag: "Sourdough" },
  { name: "All-Butter Croissants", time: "Fresh at 8 AM", tag: "Pastry" },
  { name: "Victoria Sponge Slices", time: "Fresh at 10 AM", tag: "Cake" },
  { name: "Sea-Salt Choc Cookies", time: "Fresh at 11 AM", tag: "Biscuit" },
];

export default async function HomePage() {
  const [featured, counterProducts, categories] = await Promise.all([
    getProducts({ isSpecial: true }),
    getProducts({ isSpecial: false }),
    getProductCategories(),
  ]);

  let banners: BannerImage[] = [];
  try {
    const response = await fetch(apiUrl("/api/banners"), { cache: "no-store" });
    if (response.ok) {
      banners = await response.json();
    }
  } catch {
    banners = [];
  }

  let reviews: { name: string; role: string | null; content: string; rating: number }[] = [];
  try {
    const response = await fetch(apiUrl("/api/testimonials"), { cache: "no-store" });
    if (response.ok) {
      const dbReviews = await response.json();
      if (dbReviews.length > 0) {
        reviews = dbReviews.map((r: any) => ({
          name: r.name,
          role: r.role,
          content: r.content,
          rating: r.rating,
        }));
      }
    }
  } catch {
    reviews = [];
  }
  if (reviews.length === 0) {
    reviews = [
      {
        name: "Sarah Jenkins",
        role: "Local Customer",
        content:
          "The sourdough is genuinely the best I've had outside of Paris. A true North London gem.",
        rating: 5,
      },
      {
        name: "James Okafor",
        role: "Regular since 2019",
        content:
          "Their almond croissants are dangerously good. The team always remembers my order.",
        rating: 5,
      },
      {
        name: "Emily Chen",
        role: "Wedding Customer",
        content:
          "How delighted our wedding looked with the bespoke cake. Beautiful, delicious and on time.",
        rating: 5,
      },
    ];
  }

  const gallery = GALLERY_IMAGES.slice(0, 6);

  return (
    <>
      {/* Hero */}
      {banners.length > 0 ? (
        <HomepageBanner images={banners} />
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-br from-warm via-cream to-dough">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #5c3d24 1.2px, transparent 1.4px)", backgroundSize: "26px 26px" }} />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
            <div className="animate-fade-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-crust/15 bg-white/60 px-4 py-1.5 text-sm font-semibold text-crust">
                <Sparkles size={15} className="text-honey" /> Artisan Bakery · North London
              </p>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-crust-deep sm:text-5xl lg:text-6xl">
                Freshly Baked
                <span className="block text-crust">Every Day</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-crust-deep/80">
                From slow-fermented sourdough to flaky all-butter croissants, every bake is crafted
                by hand in our London bakery and out of the oven while the city wakes up.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/order"
                  className="inline-flex items-center gap-2 rounded-full bg-crust px-7 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-crust-dark"
                >
                  Order Online <ChevronRight size={18} />
                </Link>
                <Link
                  href="/bread-pastries"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-crust bg-transparent px-7 py-3.5 text-base font-semibold text-crust transition hover:bg-crust hover:text-white"
                >
                  Explore the Bakes
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-crust-deep/70">
                <div className="flex items-center gap-2">
                  <span className="flex gap-0.5 text-honey">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className="fill-honey" />)}</span>
                  <span className="font-semibold">4.9 / 5</span>
                </div>
                <div className="flex items-center gap-2"><Clock size={16} className="text-crust" /> Open from 7 AM daily</div>
              </div>
            </div>

            <div className="relative animate-float">
              <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-crust/15">
                <img
                  src="https://images.pexels.com/photos/30826792/pexels-photo-30826792.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900"
                  alt="Fresh artisan sourdough loaves at House of Bread London"
                  className="h-[460px] w-full object-cover"
                />
              </div>
              <div className="absolute -left-4 top-8 hidden rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm text-crust"><Wheat size={20} /></span>
                  <div>
                    <p className="text-xs text-crust/60">Baked at dawn</p>
                    <p className="font-display font-bold text-crust-deep">24h Fermentation</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-3 bottom-10 hidden rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm text-crust"><Award size={20} /></span>
                  <div>
                    <p className="text-xs text-crust/60">London pastry prize</p>
                    <p className="font-display font-bold text-crust-deep">Best Croissant 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <FeaturedBakesCarousel products={featured} />
      <MoreFromCounter initialProducts={counterProducts} categories={categories} />

      {/* Today's fresh bakes */}
      <section className="bg-crust-deep py-16 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-honey">Straight from the oven</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Today&apos;s Fresh Bakes</h2>
            <p className="mx-auto mt-3 max-w-2xl text-cream/70">
              Everything is baked in small batches through the day, so it&apos;s always at its best.
              Here&apos;s when to find the good stuff.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {todayBakes.map((b) => (
              <div key={b.name} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur transition hover:bg-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-honey">{b.tag}</p>
                <p className="mt-2 font-display text-lg font-bold text-white">{b.name}</p>
                <p className="mt-1 text-sm text-cream/60">{b.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category highlights */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Wheat, title: "Artisan Bread", desc: "Sourdough, rye and rustic loaves with a proud crackle.", img: "https://images.pexels.com/photos/30890566/pexels-photo-30890566.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
              { icon: Soup, title: "Cakes & Desserts", desc: "Celebration cakes and indulgent small bakes, made to order.", img: "https://images.pexels.com/photos/32916204/pexels-photo-32916204.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
              { icon: Clock, title: "Coffee & Drinks", desc: "Single-origin espresso and seasonal drinks to pair.", img: "https://images.pexels.com/photos/21370678/pexels-photo-21370678.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" },
            ].map((c) => (
              <Link key={c.title} href="/order" className="group relative h-72 overflow-hidden rounded-3xl shadow-lg">
                <img src={c.img} alt={c.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-crust-deep/90 via-crust-deep/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-honey backdrop-blur"><c.icon size={20} /></span>
                  <h3 className="mt-3 font-display text-2xl font-bold text-white">{c.title}</h3>
                  <p className="mt-1 text-sm text-cream/85">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About highlight */}
      <section className="bg-warm py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.pexels.com/photos/5947593/pexels-photo-5947593.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="Baker kneading dough" className="h-56 w-full rounded-2xl object-cover shadow-md" />
            <img src="https://images.pexels.com/photos/29380155/pexels-photo-29380155.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="Bakery interior" className="mt-8 h-56 w-full rounded-2xl object-cover shadow-md" />
            <img src="https://images.pexels.com/photos/20002837/pexels-photo-20002837.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="Fresh croissants" className="h-56 w-full rounded-2xl object-cover shadow-md" />
            <img src="https://images.pexels.com/photos/13247705/pexels-photo-13247705.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="Holding a loaf" className="mt-8 h-56 w-full rounded-2xl object-cover shadow-md" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-crust/60">House of Bread London</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-crust-deep sm:text-4xl">Baking with pride, since 2010</h2>
            <BreadSlice className="mt-3 h-6 w-16 text-honey" />
            <p className="mt-4 text-lg text-crust-deep/80">
              We&apos;re a small, family-run bakery on the corner of Crown Lane. Every loaf is shaped
              by hand, every croissant laminated with real French butter, and every cake baked to
              celebrate your moments.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Leaf, text: "Stone-milled flour & naturally leavened doughs" },
                { icon: Heart, text: "Made fresh each morning, never left overnight" },
                { icon: Award, text: "Award-winning pastry & celebrate 14 years in London" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-crust-deep/80">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-crust"><item.icon size={15} /></span>
                  {item.text}
                </li>
              ))}
            </ul>
            <Link href="/about" className="mt-7 inline-flex items-center gap-2 font-semibold text-crust transition hover:text-crust-dark">
              Read our story <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-crust/60">Word of mouth</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-crust-deep sm:text-4xl">What Our Customers Say</h2>
            <BreadSlice className="mx-auto mt-3 h-6 w-16 text-honey" />
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
                <div className="flex gap-0.5 text-honey">{Array.from({ length: r.rating }).map((_, s) => <Star key={s} size={16} className="fill-honey" />)}</div>
                <p className="mt-3 italic text-crust-deep/80">&ldquo;{r.content}&rdquo;</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-display font-bold text-crust-deep">{r.name}</p>
                    <p className="text-sm text-crust/60">{r.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-crust/60">From the bakery</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-crust-deep">A Little Taste</h2>
            </div>
            <Link href="/gallery" className="inline-flex items-center gap-1 text-sm font-semibold text-crust transition hover:text-crust-dark">See the gallery <ChevronRight size={16} /></Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {gallery.map((g) => (
              <div key={g.src} className="group relative aspect-square overflow-hidden rounded-xl">
                <img src={g.src} alt={g.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact + map */}
      <section className="bg-warm py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-crust/60">Find us</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-crust-deep sm:text-4xl">Visit the Bakery</h2>
            <BreadSlice className="mt-3 h-6 w-16 text-honey" />
            <p className="mt-4 text-crust-deep/80">
              Drop by for a fresh loaf, a sky-high croissant or a flat white. We&apos;re right by
              the Crouch End green — you&apos;ll smell the bread before you turn the corner.
            </p>
            <ul className="mt-6 space-y-4 text-crust-deep/80">
              <li className="flex gap-3"><MapPin size={20} className="mt-0.5 shrink-0 text-crust" />{CONTACT_INFO.address}</li>
              <li className="flex gap-3"><Phone size={20} className="mt-0.5 shrink-0 text-crust" />{CONTACT_INFO.phone}</li>
              <li className="flex gap-3"><Mail size={20} className="mt-0.5 shrink-0 text-crust" /><a href="mailto:hello@houseofbreadlondon.co.uk" className="hover:text-crust">hello@houseofbreadlondon.co.uk</a></li>
            </ul>
            <div className="mt-6">
              <p className="font-display font-bold text-crust-deep">Opening Hours</p>
              <div className="mt-2 space-y-1.5 text-sm text-crust-deep/80">
                {CONTACT_INFO.hours.map((h) => (
                  <div key={h.day} className="flex justify-between border-b border-crust/10 pb-1"><span>{h.day}</span><span className="font-medium">{h.time}</span></div>
                ))}
              </div>
            </div>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 rounded-full bg-crust px-6 py-3 font-semibold text-white transition hover:bg-crust-dark">Contact us <ChevronRight size={18} /></Link>
          </div>
          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-crust/10">
            <iframe
              title="House of Bread London location map"
              className="h-full min-h-[420px] w-full"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-0.125%2C51.570%2C-0.065%2C51.590&layer=mapnik&marker=51.580%2C-0.095"
            />
          </div>
        </div>
      </section>
    </>
  );
}


