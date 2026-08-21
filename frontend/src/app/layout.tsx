import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
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
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-cream text-crust-deep antialiased">
        {children}
      </body>
    </html>
  );
}
