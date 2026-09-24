import Link from "next/link";
import { Camera, Globe, AtSign, MapPin, Phone, Mail, Clock, Wheat } from "lucide-react";
import { siteConfig, navLinks } from "@/config/site";
import { CONTACT_INFO } from "@/data/products";

export default function Footer() {
  return (
    <footer className="bg-crust-deep text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-honey to-crust text-white">
                <Wheat size={20} />
              </span>
              <span className="font-display text-xl font-bold">House of Bread</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              Freshly baked every day in the heart of London. Slow-fermented sourdough, flaky
              pastries and celebration cakes crafted with love since 2010.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={siteConfig.socials.instagram} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-honey hover:text-crust-deep" aria-label="Instagram">
                <Camera size={16} />
              </a>
              <a href={siteConfig.socials.facebook} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-honey hover:text-crust-deep" aria-label="Facebook">
                <Globe size={16} />
              </a>
              <a href={siteConfig.socials.twitter} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-honey hover:text-crust-deep" aria-label="Twitter">
                <AtSign size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-honey">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cream/70 transition hover:text-honey">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-honey">
              Visit Us
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-cream/70">
              <li className="flex gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-honey" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex gap-2.5">
                <Phone size={16} className="mt-0.5 shrink-0 text-honey" />
                <a href={`tel:${siteConfig.phone}`} className="transition hover:text-honey">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail size={16} className="mt-0.5 shrink-0 text-honey" />
                <a href={`mailto:${siteConfig.email}`} className="transition hover:text-honey">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-honey">
              Opening Hours
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              {CONTACT_INFO.hours.map((h) => (
                <li key={h.day} className="flex items-start gap-2.5">
                  <Clock size={16} className="mt-0.5 shrink-0 text-honey" />
                  <div>
                    <span className="block text-cream/70">{h.day}</span>
                    <span className="font-medium text-cream">{h.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-cream/50">
          <div>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Freshly baked every
            day.
          </div>
          <div>
            <Link href="/dashboard" className="font-semibold text-cream/60 transition hover:text-honey">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
