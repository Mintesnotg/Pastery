import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PublicProviders } from "@/components/PublicProviders";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <PublicProviders>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </PublicProviders>
  );
}
