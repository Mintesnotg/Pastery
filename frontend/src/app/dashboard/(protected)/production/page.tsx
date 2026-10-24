"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Factory,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
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

const BAKE_COLUMNS = [
  { status: "pending", label: "Pending" },
  { status: "confirmed", label: "Confirmed" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
] as const;

const NEXT_STATUS: Record<string, string | null> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
  completed: null,
  cancelled: null,
};

function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function itemSummary(order: Order) {
  const items = order.items ?? [];
  if (!items.length) return "No items";
  return items
    .map((i) => `${i.quantity}× ${i.productName}`)
    .slice(0, 4)
    .join(", ") + (items.length > 4 ? ` +${items.length - 4}` : "");
}

export default function ProductionBoardPage() {
  const { toast, showToast, dismiss } = useToast();
  const [date, setDate] = useState(todayYmd);
  const [channel, setChannel] = useState<"all" | "retail" | "wholesale">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showDone, setShowDone] = useState(false);
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

  const byStatus = useMemo(() => {
    const map = new Map<string, Order[]>();
    for (const col of BAKE_COLUMNS) map.set(col.status, []);
    map.set("completed", []);
    map.set("cancelled", []);
    for (const order of orders) {
      if (map.has(order.status)) {
        map.get(order.status)!.push(order);
      } else {
        map.get("pending")!.push(order);
      }
    }
    return map;
  }, [orders]);

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
      showToast(`Order ${orderNumber(order.id)} → ${status}`, "success");
      setCompleteTarget(null);
      await load();
    } finally {
      setProcessingId(null);
    }
  };

  const requestAdvance = (order: Order) => {
    const next = NEXT_STATUS[order.status] ?? null;
    if (!next) return;
    if (next === "completed" && order.fulfillmentType === "delivery" && !order.deliveryNote) {
      setCompleteTarget(order);
      return;
    }
    void setStatus(order, next);
  };

  const renderCard = (order: Order) => {
    const next = NEXT_STATUS[order.status] ?? null;
    const busy = processingId === order.id;
    return (
      <article
        key={order.id}
        className="rounded-xl border border-crust/10 bg-white p-3 shadow-sm"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-crust-deep">{order.customerName}</p>
            <p className="text-xs text-crust/55">{orderNumber(order.id)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            <span className="rounded-full bg-peach/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-crust">
              {order.channel ?? "retail"}
            </span>
            <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase text-crust/80">
              {order.fulfillmentType ?? "pickup"}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-crust/80">
          <span className="font-medium">{order.pickupTime}</span>
          {" · "}
          {formatMoney(order.total)}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-crust/60">{itemSummary(order)}</p>
        {order.fulfillmentType === "delivery" && order.deliveryAddress ? (
          <p className="mt-1 text-xs text-crust/50">
            {truncateAddress(order.deliveryAddress, 56)}
          </p>
        ) : null}
        {order.status !== "completed" && order.status !== "cancelled" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {next ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => requestAdvance(order)}
                className="inline-flex items-center gap-1 rounded-lg bg-crust px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
                Advance
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => void setStatus(order, "cancelled")}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        ) : null}
      </article>
    );
  };

  const doneOrders = [...(byStatus.get("completed") ?? []), ...(byStatus.get("cancelled") ?? [])];

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
                Bake board by fulfillment date. Advance orders through the kitchen pipeline.
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
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-crust/10 bg-white py-16 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-crust" />
        </div>
      ) : orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-crust/20 bg-cream/40 px-4 py-12 text-center text-sm text-crust/70">
          No orders for {date}
          {channel !== "all" ? ` (${channel})` : ""}.
        </p>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
            {BAKE_COLUMNS.map((col) => {
              const list = byStatus.get(col.status) ?? [];
              return (
                <div
                  key={col.status}
                  className="flex min-h-48 flex-col rounded-2xl border border-crust/10 bg-cream/30 p-3"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="text-sm font-semibold text-crust-deep">{col.label}</h2>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-crust/70">
                      {list.length}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    {list.length === 0 ? (
                      <p className="px-1 text-xs text-crust/45">Empty</p>
                    ) : (
                      list.map(renderCard)
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {doneOrders.length > 0 ? (
            <div className="rounded-2xl border border-crust/10 bg-white p-4 shadow-sm">
              <button
                type="button"
                className="flex w-full items-center justify-between text-left text-sm font-semibold text-crust-deep"
                onClick={() => setShowDone((v) => !v)}
              >
                Completed & cancelled ({doneOrders.length})
                <span className="text-xs font-normal text-crust/50">{showDone ? "Hide" : "Show"}</span>
              </button>
              {showDone ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {doneOrders.map(renderCard)}
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
