"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Receipt, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";
import {
  fetchAdminInvoices,
  formatMoney,
  mondayOfWeek,
  todayYmd,
  type GenerateInvoicesResult,
  type Invoice,
} from "@/lib/invoices";

function statusBadge(status: Invoice["display_status"]) {
  const styles: Record<Invoice["display_status"], string> = {
    open: "bg-amber-50 text-amber-800",
    overdue: "bg-rose-50 text-rose-700",
    paid: "bg-emerald-50 text-emerald-700",
    void: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function AdminInvoicesPage() {
  const { toast, showToast, dismiss } = useToast();
  const [rows, setRows] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => mondayOfWeek(todayYmd()));
  const [generating, setGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<GenerateInvoicesResult | null>(null);
  const [payTarget, setPayTarget] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"bank_transfer" | "cash" | "mobile">("bank_transfer");
  const [payReference, setPayReference] = useState("");
  const [paying, setPaying] = useState(false);
  const [voidingId, setVoidingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchAdminInvoices());
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    setLastResult(null);
    try {
      const res = await fetch(
        apiUrl("/api/invoices/generate"),
        withPermission("create.invoice", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ week_start: weekStart }),
        }),
      );
      const data = (await res.json().catch(() => ({}))) as GenerateInvoicesResult & {
        error?: string;
      };
      if (!res.ok) {
        showToast(data.error ?? "Generate failed", "error");
        return;
      }
      setLastResult(data);
      showToast(
        `Created ${data.created_count} invoice(s); skipped ${data.skipped_count}`,
        "success",
      );
      await load();
    } finally {
      setGenerating(false);
    }
  };

  const openPay = (invoice: Invoice) => {
    setPayTarget(invoice);
    setPayAmount(String(invoice.amount_due.toFixed(2)));
    setPayMethod("bank_transfer");
    setPayReference("");
  };

  const submitPayment = async () => {
    if (!payTarget) return;
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Enter a valid amount", "error");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch(
        apiUrl(`/api/invoices/${payTarget.id}/payments`),
        withPermission("record.payment", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            method: payMethod,
            reference: payReference.trim() || null,
          }),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Payment failed", "error");
        return;
      }
      showToast("Payment recorded", "success");
      setPayTarget(null);
      await load();
    } finally {
      setPaying(false);
    }
  };

  const handleVoid = async (invoice: Invoice) => {
    if (!confirm(`Void invoice ${invoice.invoice_number}?`)) return;
    setVoidingId(invoice.id);
    try {
      const res = await fetch(
        apiUrl(`/api/invoices/${invoice.id}/void`),
        withPermission("create.invoice", {
          method: "POST",
          credentials: "include",
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Void failed", "error");
        return;
      }
      showToast("Invoice voided", "success");
      await load();
    } finally {
      setVoidingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoice_number",
        header: "Invoice",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/invoices/${row.original.id}`}
            className="font-semibold text-crust-deep hover:underline"
          >
            {row.original.invoice_number}
          </Link>
        ),
      },
      {
        id: "cafe",
        header: "Cafe",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-crust-deep">
              {row.original.business_account.business_name}
            </div>
            <div className="text-xs text-crust/60">
              {row.original.business_account.contact_user?.email}
            </div>
          </div>
        ),
      },
      {
        id: "period",
        header: "Period",
        cell: ({ row }) => (
          <span className="text-sm text-crust/80">
            {row.original.period_start} → {row.original.period_end}
          </span>
        ),
      },
      {
        accessorKey: "subtotal",
        header: "Total",
        cell: ({ row }) => formatMoney(row.original.subtotal),
      },
      {
        accessorKey: "amount_due",
        header: "Due",
        cell: ({ row }) => formatMoney(row.original.amount_due),
      },
      {
        accessorKey: "due_date",
        header: "Due date",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => statusBadge(row.original.display_status),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex flex-wrap justify-end gap-2">
              {inv.status === "open" && inv.amount_due > 0 ? (
                <button
                  type="button"
                  onClick={() => openPay(inv)}
                  className="rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  Record payment
                </button>
              ) : null}
              {inv.status === "open" && inv.amount_paid === 0 ? (
                <button
                  type="button"
                  disabled={voidingId === inv.id}
                  onClick={() => void handleVoid(inv)}
                  className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
                >
                  Void
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [voidingId],
  );

  return (
    <section className="space-y-6">
      <Toast toast={toast} onDismiss={dismiss} />

      <Modal
        isOpen={payTarget != null}
        onClose={() => (!paying ? setPayTarget(null) : undefined)}
        title="Record invoice payment"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={paying}
              onClick={() => setPayTarget(null)}
              className="rounded-lg border border-crust/20 px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={paying}
              onClick={() => void submitPayment()}
              className="rounded-lg bg-crust px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {paying ? "Saving…" : "Save payment"}
            </button>
          </div>
        }
      >
        {payTarget ? (
          <div className="space-y-3">
            <p className="text-sm text-crust/70">
              {payTarget.invoice_number} · due {formatMoney(payTarget.amount_due)}
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">Amount (£)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Method</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value as typeof payMethod)}
              >
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Reference</label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        ) : null}
      </Modal>

      <div className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-peach/60 p-2 text-crust">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-crust-deep">Invoices</h1>
              <p className="mt-1 text-sm text-crust/70">
                Weekly credit statements from completed wholesale orders.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-crust/20 px-3 py-2 text-sm font-medium text-crust hover:bg-cream disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Week starting (Monday)
            </label>
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={weekStart}
              onChange={(e) => setWeekStart(mondayOfWeek(e.target.value || todayYmd()))}
            />
          </div>
          <button
            type="button"
            disabled={generating}
            onClick={() => void handleGenerate()}
            className="inline-flex items-center gap-2 rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Generate week
          </button>
        </div>

        {lastResult ? (
          <p className="mt-3 text-sm text-crust/70">
            Week {lastResult.week_start} → {lastResult.period_end}: created{" "}
            {lastResult.created_count}, skipped {lastResult.skipped_count}.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-crust/10 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-crust" />
          </div>
        ) : (
          <DataTable columns={columns} data={rows} emptyMessage="No invoices yet." />
        )}
      </div>
    </section>
  );
}
