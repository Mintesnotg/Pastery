"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  fetchInvoiceById,
  formatMoney,
  type Invoice,
} from "@/lib/invoices";

function statusLabel(status: Invoice["display_status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setError("Invalid invoice");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchInvoiceById(id, "create.invoice");
        if (!cancelled) setInvoice(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/dashboard/invoices"
        className="inline-flex items-center gap-1 text-sm font-medium text-crust/70 hover:text-crust"
      >
        <ArrowLeft className="h-4 w-4" /> Back to invoices
      </Link>

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-crust/10 bg-white py-16">
          <Loader2 className="h-7 w-7 animate-spin text-crust" />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {invoice ? (
        <div className="space-y-4 rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-crust-deep">
                {invoice.invoice_number}
              </h1>
              <p className="mt-1 text-sm text-crust/70">
                {invoice.business_account.business_name} · {invoice.period_start} →{" "}
                {invoice.period_end}
              </p>
            </div>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold capitalize text-crust">
              {statusLabel(invoice.display_status)}
            </span>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="text-crust/55">Invoice date</dt>
              <dd className="font-medium text-crust-deep">{invoice.invoice_date}</dd>
            </div>
            <div>
              <dt className="text-crust/55">Due date</dt>
              <dd className="font-medium text-crust-deep">{invoice.due_date}</dd>
            </div>
            <div>
              <dt className="text-crust/55">Subtotal</dt>
              <dd className="font-medium text-crust-deep">{formatMoney(invoice.subtotal)}</dd>
            </div>
            <div>
              <dt className="text-crust/55">Amount due</dt>
              <dd className="font-medium text-crust-deep">{formatMoney(invoice.amount_due)}</dd>
            </div>
          </dl>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-crust/60">
              Lines
            </h2>
            <ul className="divide-y divide-crust/10 rounded-xl border border-crust/10">
              {invoice.lines.map((line) => (
                <li key={line.id} className="flex justify-between gap-3 px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-crust-deep">{line.description}</p>
                    <p className="text-xs text-crust/55">Order #HB-{line.order_id}</p>
                  </div>
                  <p className="shrink-0 font-semibold">{formatMoney(line.amount)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-crust/60">
              Payments
            </h2>
            {invoice.payments.length === 0 ? (
              <p className="text-sm text-crust/60">No payments recorded.</p>
            ) : (
              <ul className="divide-y divide-crust/10 rounded-xl border border-crust/10">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3 px-3 py-2.5 text-sm">
                    <div>
                      <p className="font-medium capitalize text-crust-deep">
                        {p.method.replace("_", " ")}
                      </p>
                      <p className="text-xs text-crust/55">
                        {new Date(p.paid_at).toLocaleString("en-GB")}
                        {p.reference ? ` · ${p.reference}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold">{formatMoney(p.amount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
