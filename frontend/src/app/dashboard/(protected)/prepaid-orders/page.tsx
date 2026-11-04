"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DollarSign, Loader2, RefreshCw } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";
import { formatMoney, orderNumber, type Order } from "@/lib/orders";

function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isPrepaidActive(order: Order) {
  return order.paymentTerms === "prepaid" && order.status !== "cancelled";
}

type PaymentFilter = "all" | "unpaid" | "paid";

export default function PrepaidOrdersPage() {
  const { toast, showToast, dismiss } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [createdDate, setCreatedDate] = useState(todayYmd);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (createdDate) qs.set("createdDate", createdDate);
      const res = await fetch(
        apiUrl(`/api/orders?${qs}`),
        withPermission("view.orders", { credentials: "include" }),
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to load orders", "error");
        return;
      }
      const data = (await res.json()) as Order[];
      setOrders(Array.isArray(data) ? data.filter(isPrepaidActive) : []);
    } finally {
      setLoading(false);
    }
  }, [createdDate, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = orders;
    if (paymentFilter === "unpaid") {
      list = list.filter((o) => !o.prepaidPaidAt);
    } else if (paymentFilter === "paid") {
      list = list.filter((o) => Boolean(o.prepaidPaidAt));
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        orderNumber(o.id).toLowerCase().includes(q) ||
        String(o.id).includes(q),
    );
  }, [orders, paymentFilter, search]);

  const handleMarkPaid = async (orderId: number) => {
    setProcessingId(orderId);
    try {
      const res = await fetch(
        apiUrl(`/api/orders/${orderId}/mark-paid`),
        withPermission("view.orders", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Mark paid failed", "error");
        return;
      }
      const paidAt =
        (data as { order?: { prepaidPaidAt?: string } }).order?.prepaidPaidAt ??
        new Date().toISOString();
      showToast(`Order ${orderNumber(orderId)} marked paid`, "success");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, prepaidPaidAt: paidAt } : o)),
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-peach/60 p-2 text-crust">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-crust-deep">Prepaid orders</h1>
              <p className="mt-1 text-sm text-crust/70">
                Prepaid retail and wholesale (tier 0) orders by placed date. Mark unpaid ones paid
                when payment is received.
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Placed date</label>
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={createdDate}
              onChange={(e) => setCreatedDate(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Payment</label>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
            >
              <option value="all">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div className="min-w-48 flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">Search</label>
            <input
              type="search"
              placeholder="Customer, email, or order #"
              className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-2xl border border-crust/10 bg-white py-16 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-crust" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-crust/20 bg-cream/40 px-4 py-12 text-center text-sm text-crust/70">
          No prepaid orders for {createdDate}
          {paymentFilter !== "all" ? ` (${paymentFilter})` : ""}
          {search.trim() ? " matching your search" : ""}.
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
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-crust/5">
              {filtered.map((order) => {
                const busy = processingId === order.id;
                const paid = Boolean(order.prepaidPaidAt);
                return (
                  <tr key={order.id} className="align-top hover:bg-cream/20">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-crust-deep">
                      {orderNumber(order.id)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-crust-deep">{order.customerName}</p>
                      <p className="text-xs text-crust/55">{order.email}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-crust/80">
                      {order.channel ?? "retail"}
                    </td>
                    <td className="px-4 py-3 text-crust/80">
                      <p className="capitalize">{order.fulfillmentType ?? "pickup"}</p>
                      <p className="text-xs text-crust/55">
                        {order.pickupDate} @ {order.pickupTime}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-crust-deep">
                      {formatMoney(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-crust/80">
                      {order.status}
                    </td>
                    <td className="px-4 py-3">
                      {paid ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                          paid
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-800">
                          unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!paid ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleMarkPaid(order.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                        >
                          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          Mark paid
                        </button>
                      ) : null}
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
