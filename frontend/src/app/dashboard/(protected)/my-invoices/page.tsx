"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import {
  fetchMyInvoices,
  formatMoney,
  type Invoice,
} from "@/lib/invoices";

function statusClass(status: Invoice["display_status"]) {
  switch (status) {
    case "overdue":
      return "bg-rose-50 text-rose-700";
    case "paid":
      return "bg-emerald-50 text-emerald-700";
    case "void":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-amber-50 text-amber-800";
  }
}

export default function MyInvoicesPage() {
  const { toast, showToast, dismiss } = useToast();
  const [rows, setRows] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchMyInvoices());
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-peach/60 p-2 text-crust">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-crust-deep">My invoices</h1>
            <p className="mt-1 text-sm text-crust/70">
              Weekly credit statements for your cafe account.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-crust/10 bg-white py-16">
          <Loader2 className="h-7 w-7 animate-spin text-crust" />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-crust/20 bg-cream/40 px-4 py-12 text-center text-sm text-crust/70">
          No invoices yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/dashboard/my-invoices/${inv.id}`}
                className="block rounded-2xl border border-crust/10 bg-white p-4 shadow-sm transition hover:border-crust/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-crust-deep">{inv.invoice_number}</p>
                    <p className="mt-0.5 text-sm text-crust/65">
                      {inv.period_start} → {inv.period_end}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusClass(inv.display_status)}`}
                  >
                    {inv.display_status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-crust/80">
                  <span>Total {formatMoney(inv.subtotal)}</span>
                  <span>Due {formatMoney(inv.amount_due)}</span>
                  <span>Pay by {inv.due_date}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
