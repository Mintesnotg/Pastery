import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { CONTACT_INFO } from "@/data/products";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact Us",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        breadcrumb="Contact Us"
        title="We&apos;d Love to Hear From You"
        subtitle="Questions about our bakes, a bespoke cake enquiry, or feedback on your last loaf — drop us a line."
      />

      <section className="py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          {/* Info panel */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-crust-deep">Get in Touch</h2>
            <p className="mt-2 text-crust-deep/70">We reply to every message within one business day.</p>
            <div className="mt-6 space-y-5">
              {[
                { icon: MapPin, label: "Visit the shop", value: CONTACT_INFO.address, href: null },
                { icon: Phone, label: "Call us", value: CONTACT_INFO.phone, href: `tel:${CONTACT_INFO.phone}` },
                { icon: Mail, label: "Email", value: "hello@houseofbreadlondon.co.uk", href: "mailto:hello@houseofbreadlondon.co.uk" },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4 rounded-2xl border border-crust/10 bg-white p-4 shadow-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warm text-crust"><c.icon size={20} /></span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-crust/60">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="mt-0.5 font-medium text-crust-deep hover:text-crust">{c.value}</a>
                    ) : (
                      <p className="mt-0.5 font-medium text-crust-deep">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-crust/10 bg-crust-deep p-5 text-cream">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-honey" />
                <h3 className="font-display text-lg font-bold text-white">Opening Hours</h3>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                {CONTACT_INFO.hours.map((h) => (
                  <div key={h.day} className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-cream/70">{h.day}</span>
                    <span className="font-medium">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-crust/10 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl font-bold text-crust-deep">Send a Message</h2>
              <p className="mt-1 text-sm text-crust/70">Fields marked * are required.</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 font-display text-2xl font-bold text-crust-deep">Find Us</h2>
          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-crust/10">
            <iframe
              title="House of Bread London map"
              className="h-[420px] w-full"
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-0.125%2C51.570%2C-0.065%2C51.590&layer=mapnik&marker=51.580%2C-0.095"
            />
          </div>
        </div>
      </section>
    </>
  );
}
