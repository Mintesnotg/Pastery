"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, RefreshCw } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type StandingOrder = {
  id: number;
  weekdays: number[];
  fulfillment_type: "pickup" | "delivery";
  preferred_time: string;
  active: boolean;
  items: { product_id: number; quantity: number; product_name?: string | null }[];
  business_account?: { id: number; business_name: string };
  contact_user?: { id: string; email: string; full_name: string };
};

type GenerateResult = {
  date: string;
  weekday: number;
  created_count: number;
  skipped_count: number;
  created: { standing_order_id: number; order_id: number }[];
  skipped: { standing_order_id: number; reason: string }[];
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatWeekdays(days: number[]) {
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_LABELS[d - 1] ?? String(d))
    .join(", ");
}

function todayYmd() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function StandingOrdersAdminPage() {
  const { toast, showToast, dismiss } = useToast();
  const [rows, setRows] = useState<StandingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayYmd);
  const [generating, setGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<GenerateResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl("/api/standing-orders"),
        withPermission("manage.standing_orders", { credentials: "include" }),
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to load standing orders", "error");
        return;
      }
      setRows(await res.json());
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
        apiUrl("/api/standing-orders/generate"),
        withPermission("manage.standing_orders", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: date || undefined }),
        }),
      );
      const data = (await res.json().catch(() => ({}))) as GenerateResult & { error?: string };
      if (!res.ok) {
        showToast(data.error ?? "Generate failed", "error");
        return;
      }
      setLastResult(data);
      showToast(
        `Generated ${data.created_count} order(s); skipped ${data.skipped_count}`,
        "success",
      );
    } finally {
      setGenerating(false);
    }
  };

  const columns = useMemo<ColumnDef<StandingOrder>[]>(
    () => [
      {
        id: "cafe",
        header: "Cafe",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-crust-deep">
              {row.original.business_account?.business_name ?? "—"}
            </div>
            <div className="text-xs text-crust/60">{row.original.contact_user?.email}</div>
          </div>
        ),
      },
      {
        id: "weekdays",
        header: "Weekdays",
        cell: ({ row }) => formatWeekdays(row.original.weekdays),
      },
      {
        accessorKey: "preferred_time",
        header: "Time",
      },
      {
        accessorKey: "fulfillment_type",
        header: "Fulfillment",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.fulfillment_type}</span>
        ),
      },
      {
        id: "items",
        header: "Items",
        cell: ({ row }) =>
          row.original.items
            .map((i) => `${i.quantity}× ${i.product_name ?? `#${i.product_id}`}`)
            .join(", "),
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              row.original.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            {row.original.active ? "Active" : "Inactive"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <section className="space-y-6">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-xl bg-peach/60 p-2 text-crust">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-crust-deep">Standing orders</h1>
            <p className="mt-1 text-sm text-crust/70">
              Generate wholesale orders from active templates for a chosen date (defaults to today).
              Cut-off and credit rules apply the same as place order.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Target date</label>
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={generating || !date}
            onClick={() => void handleGenerate()}
            className="inline-flex items-center gap-2 rounded-lg bg-crust px-5 py-2.5 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Generate today’s standing orders
          </button>
        </div>

        {lastResult ? (
          <div className="mt-4 rounded-xl border border-crust/10 bg-cream/50 p-4 text-sm">
            <p className="font-medium text-crust-deep">
              Result for {lastResult.date}: {lastResult.created_count} created,{" "}
              {lastResult.skipped_count} skipped
            </p>
            {lastResult.skipped.length > 0 ? (
              <ul className="mt-2 list-inside list-disc text-crust/70">
                {lastResult.skipped.map((s) => (
                  <li key={`${s.standing_order_id}-${s.reason}`}>
                    Standing #{s.standing_order_id}: {s.reason}
                  </li>
                ))}
              </ul>
            ) : null}
            {lastResult.created.length > 0 ? (
              <ul className="mt-2 list-inside list-disc text-crust/70">
                {lastResult.created.map((c) => (
                  <li key={c.order_id}>
                    Standing #{c.standing_order_id} → order #{c.order_id}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-crust-deep">All templates</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-crust" />
          </div>
        ) : (
          <DataTable columns={columns} data={rows} />
        )}
      </div>
    </section>
  );
}
