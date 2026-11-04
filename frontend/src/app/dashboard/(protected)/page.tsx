"use client";

import Link from "next/link";
import { ClipboardList, DollarSign, Factory } from "lucide-react";

export default function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-crust/10 bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-crust-deep">Dashboard</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-crust/70">
          Welcome. Use Operational tools for production, prepaid payments, and cafe accounts.
          Live order boards and mark-paid live under those pages—not here.
        </p>
      </div>

    </section>
  );
}
