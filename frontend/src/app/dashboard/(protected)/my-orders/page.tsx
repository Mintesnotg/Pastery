"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
} from "lucide-react";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { StatusBadge, TimelineDot } from "@/components/orders/StatusBadge";
import {
  fetchOrders,
  formatMoney,
  formatOrderDateTime,
  orderNumber,
  toStatusGroup,
  type Order,
  type OrderStatusGroup,
} from "@/lib/orders";

type FilterKey = "all" | OrderStatusGroup;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function itemCountLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

function itemsSummary(order: Order) {
  if (!order.items?.length) return "No items";
  return order.items.map((item) => `${item.productName} (${item.quantity}x)`).join(", ");
}

function contextualLine(order: Order) {
  const group = toStatusGroup(order.status);
  if (group === "delivered") {
    return {
      Icon: MapPin,
      text: "Collected at House of Bread",
    };
  }
  if (group === "cancelled") {
    return {
      Icon: RefreshCw,
      text: "Order cancelled",
    };
  }
  return {
    Icon: CalendarDays,
    text: `Baking for ${order.pickupDate} collection (${order.pickupTime})`,
  };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOrders();
        if (!cancelled) setOrders(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const next = { all: orders.length, pending: 0, delivered: 0, cancelled: 0 };
    for (const order of orders) {
      next[toStatusGroup(order.status)] += 1;
    }
    return next;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((order) => toStatusGroup(order.status) === filter);
  }, [orders, filter]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#734F32]" aria-label="Loading orders" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-[#734F32]">Order history</h1>
        <p className="mt-1.5 max-w-xl text-sm text-[#6B5648]">
          Track daily bakes, collection times, and past orders from our stone hearth.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          const count = counts[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-[#734F32] text-white"
                  : "bg-[#FDEBDD] text-[#3F2A18] hover:bg-[#F5DCC8]"
              }`}
            >
              {label}
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  active ? "bg-white text-[#734F32]" : "bg-[#F5C9A0] text-[#734F32]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="mb-4 text-sm font-medium text-red-600">{error}</p> : null}

      {orders.length === 0 && !error ? (
        <div className="rounded-3xl border border-dashed border-[#E8DDD2] bg-white px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-[#D4C4B5]" />
          <p className="mt-4 text-sm text-[#6B5648]">You have not placed any orders yet.</p>
          <a
            href="/dashboard/place-order"
            className="mt-4 inline-flex rounded-full bg-[#734F32] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
          >
            Place an order
          </a>
        </div>
      ) : null}

      {orders.length > 0 && filteredOrders.length === 0 ? (
        <p className="rounded-2xl border border-[#E8DDD2] bg-white px-5 py-10 text-center text-sm text-[#6B5648]">
          No {filter} orders to show.
        </p>
      ) : null}

      {filteredOrders.length > 0 ? (
        <ul className="relative space-y-5 before:absolute before:top-4 before:bottom-4 before:left-[15px] before:w-px before:bg-[#D9CBBE] sm:before:left-[15px]">
          {filteredOrders.map((order) => {
            const context = contextualLine(order);
            const ContextIcon = context.Icon;
            const thumbs = (order.items ?? []).filter((item) => item.productImage).slice(0, 4);
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

            return (
              <li key={order.id} className="relative flex gap-4 sm:gap-5">
                <div className="relative z-10 mt-6 shrink-0">
                  <TimelineDot status={order.status} />
                </div>

                <article className="min-w-0 flex-1 rounded-3xl border border-[#E8DDD2] bg-white p-5 shadow-[0_10px_30px_rgba(63,42,24,0.05)] sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-xl font-bold text-[#3F2A18]">
                          {orderNumber(order.id)}
                        </h2>
                        <span className="rounded-full bg-[#FDEBDD] px-2.5 py-0.5 text-xs font-semibold text-[#734F32]">
                          {itemCountLabel(itemCount)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#9A8573]">
                        {formatOrderDateTime(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="mt-5 flex flex-wrap items-start gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      {thumbs.length > 0 ? (
                        <div className="flex shrink-0 -space-x-2">
                          {thumbs.map((item, index) => (
                            <div
                              key={`${item.id}-${index}`}
                              className="h-11 w-11 overflow-hidden rounded-xl border-2 border-white bg-[#FDEBDD] shadow-sm"
                              style={{ zIndex: thumbs.length - index }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.productImage!}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEBDD] text-[#C4A484]">
                          <Package size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#3F2A18]">{itemsSummary(order)}</p>
                        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-[#9A8573]">
                          <ContextIcon size={13} className="mt-0.5 shrink-0" aria-hidden />
                          <span>{context.text}</span>
                        </p>
                      </div>
                    </div>

                    <div className="ml-auto text-right">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9A8573] uppercase">
                        Total
                      </p>
                      <p className="font-display text-2xl font-bold text-[#3F2A18]">
                        {formatMoney(order.total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#F0E6DC] pt-4">
                    <button
                      type="button"
                      onClick={() => setDetailId(order.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-[#734F32] transition hover:text-[#5A3D26]"
                    >
                      View details & receipt
                      <ExternalLink size={14} aria-hidden />
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      ) : null}

      <OrderDetailsModal
        orderId={detailId}
        isOpen={detailId != null}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
