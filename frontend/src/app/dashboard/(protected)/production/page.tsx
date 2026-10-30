"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Factory, Loader2, RefreshCw } from "lucide-react";
import { DeliveryCompleteModal } from "@/components/orders/DeliveryCompleteModal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";
import {
  formatMoney,
  orderNumber,
  truncateAddress,
  type DeliveryNotePayload,
  type Order,
} from "@/lib/orders";

const STATUS_PIPELINE = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
] as const;

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function forwardStatuses(current: string): string[] {
  const i = STATUS_PIPELINE.indexOf(current as (typeof STATUS_PIPELINE)[number]);
  if (i < 0 || current === "cancelled" || current === "completed") return [];
  return STATUS_PIPELINE.slice(i + 1) as string[];
}

function itemSummary(order: Order) {
  const items = order.items ?? [];
  if (!items.length) return "No items";
  return (
    items
      .map((i) => `${i.quantity}× ${i.productName}`)
      .slice(0, 4)
      .join(", ") + (items.length > 4 ? ` +${items.length - 4}` : "")
  );
}

function isTerminal(status: string) {
  return status === "completed" || status === "cancelled";
}

export default function ProductionBoardPage() {
  const { toast, showToast, dismiss } = useToast();
  const [date, setDate] = useState(todayYmd);
  const [channel, setChannel] = useState<"all" | "retail" | "wholesale">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (date) qs.set("date", date);
      if (channel !== "all") qs.set("channel", channel);
      const res = await fetch(
        apiUrl(`/api/orders?${qs}`),
        withPermission("view.production", { credentials: "include" }),
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to load orders", "error");
        return;
      }
      const data = (await res.json()) as Order[];
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [date, channel, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const setStatus = async (
    order: Order,
    status: string,
    deliveryNote?: DeliveryNotePayload,
  ) => {
    setProcessingId(order.id);
    try {
      const res = await fetch(
        apiUrl(`/api/orders/${order.id}`),
        withPermission("view.production", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            ...(deliveryNote ? { deliveryNote } : {}),
          }),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Update failed", "error");
        return;
      }
      showToast(`Order ${orderNumber(order.id)} → ${STATUS_LABELS[status] ?? status}`, "success");
      setCompleteTarget(null);
      await load();
    } finally {
      setProcessingId(null);
    }
  };

  const requestStatusChange = (order: Order, next: string) => {
    if (next === order.status) return;
    if (next === "completed" && order.fulfillmentType === "delivery" && !order.deliveryNote) {
      setCompleteTarget(order);
      return;
    }
    void setStatus(order, next);
  };

  return (
    <section className="space-y-6">
      <Toast toast={toast} onDismiss={dismiss} />

      <DeliveryCompleteModal
        isOpen={completeTarget != null}
        orderLabel={completeTarget ? orderNumber(completeTarget.id) : undefined}
        busy={completeTarget != null && processingId === completeTarget.id}
        onClose={() => {
          if (processingId == null) setCompleteTarget(null);
        }}
        onConfirm={(note) => {
          if (!completeTarget) return;
          void setStatus(completeTarget, "completed", note);
        }}
      />

      <div className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-peach/60 p-2 text-crust">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-crust-deep">Production</h1>
              <p className="mt-1 text-sm text-crust/70">
                Orders by fulfillment date. Update status with the dropdown (forward only).
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Channel</label>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={channel}
              onChange={(e) => setChannel(e.target.value as typeof channel)}
            >
              <option value="all">All</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-crust/10 bg-white py-16 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-crust" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-crust/20 bg-cream/40 px-4 py-12 text-center text-sm text-crust/70">
          No orders for {date}
          {channel !== "all" ? ` (${channel})` : ""}
          {statusFilter !== "all" ? ` · ${STATUS_LABELS[statusFilter] ?? statusFilter}` : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-crust/10 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-crust/10 bg-cream/40 text-xs font-semibold uppercase tracking-wide text-crust/70">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crust/5">
              {filteredOrders.map((order) => {
                const busy = processingId === order.id;
                const options = [...forwardStatuses(order.status), "cancelled"];
                return (
                  <tr key={order.id} className="align-top hover:bg-cream/20">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-crust-deep">
                      {orderNumber(order.id)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-crust-deep">{order.customerName}</p>
                      {order.fulfillmentType === "delivery" && order.deliveryAddress ? (
                        <p className="mt-0.5 text-xs text-crust/50">
                          {truncateAddress(order.deliveryAddress, 48)}
                        </p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-crust/80">
                      {order.channel ?? "retail"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-crust/80">
                      {order.fulfillmentType ?? "pickup"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-crust/80">
                      {order.pickupTime}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-crust/80">
                      {formatMoney(order.total)}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-crust/65">
                      {itemSummary(order)}
                    </td>
                    <td className="px-4 py-3">
                      {isTerminal(order.status) ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            order.status === "completed"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-rose-50 text-rose-800"
                          }`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-crust disabled:opacity-60"
                            value={order.status}
                            disabled={busy}
                            onChange={(e) => {
                              const next = e.target.value;
                              e.target.value = order.status;
                              requestStatusChange(order, next);
                            }}
                          >
                            <option value={order.status}>
                              {STATUS_LABELS[order.status] ?? order.status}
                            </option>
                            {options.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_LABELS[s] ?? s}
                              </option>
                            ))}
                          </select>
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-crust/50" />
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
