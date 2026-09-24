"use client";

import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { apiUrl } from "@/lib/api";

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
};

type Order = {
  id: number;
  customerName: string;
  email: string;
  phone: string | null;
  pickupDate: string;
  pickupTime: string;
  notes: string | null;
  total: string | number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

function formatMoney(value: string | number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? `£${n.toFixed(2)}` : String(value);
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/orders"), { credentials: "include" });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error || "Failed to load orders");
        }
        const data = (await res.json()) as Order[];
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" aria-label="Loading orders" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
        <p className="mt-1 text-sm text-gray-500">Your pickup orders and their current status.</p>
      </div>

      {error ? <p className="mb-4 text-sm font-medium text-red-600">{error}</p> : null}

      {orders.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">You have not placed any orders yet.</p>
          <a
            href="/order"
            className="mt-4 inline-flex rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Place an order
          </a>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Order #{order.id}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Pickup {order.pickupDate} at {order.pickupTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {order.status}
                  </span>
                  <p className="mt-2 text-base font-semibold text-gray-900">{formatMoney(order.total)}</p>
                </div>
              </div>
              {order.items?.length ? (
                <ul className="mt-4 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between gap-3">
                      <span>
                        {item.quantity}× {item.productName}
                      </span>
                      <span className="shrink-0">{formatMoney(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {order.notes ? (
                <p className="mt-3 text-xs text-gray-500">Notes: {order.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
