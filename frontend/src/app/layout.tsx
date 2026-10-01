import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { siteConfig } from "@/config/site";

// Brand typography (docs/brand/README.md §3): Fraunces for display, Plus Jakarta Sans for text and UI.
// Both are loaded as variable fonts; Fraunces keeps its optical-size axis so large headings
// get the display cut automatically.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

const shareImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} — ${siteConfig.tagline}`,
};

export const viewport: Viewport = {
  themeColor: "#FAF6EF",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "artisan bakery london",
    "sourdough bread",
    "fresh croissants",
    "celebration cakes",
    "coffee shop",
    "house of bread london",
  ],
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_GB",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [shareImage.url],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col bg-cream text-crust-deep antialiased">
        {children}
      </body>
    </html>
  );
}
