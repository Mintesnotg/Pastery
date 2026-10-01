"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { DetailSection } from "@/components/orders/DetailSection";
import { InfoRow } from "@/components/orders/InfoRow";
import { PriceSummary } from "@/components/orders/PriceSummary";
import { StatusBadge } from "@/components/orders/StatusBadge";
import {
  fetchOrderById,
  formatMoney,
  formatOrderDateTime,
  orderNumber,
  type Order,
} from "@/lib/orders";

type OrderDetailsModalProps = {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
};

export function OrderDetailsModal({ orderId, isOpen, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || orderId == null) {
      setOrder(null);
      setError("");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    setOrder(null);

    (async () => {
      try {
        const data = await fetchOrderById(orderId);
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, orderId]);

  const subtotal = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, item) => {
      const n = typeof item.lineTotal === "number" ? item.lineTotal : Number(item.lineTotal);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [order]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? `Order ${orderNumber(order.id)}` : "Order details"}
      size="lg"
    >
      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#734F32]" aria-label="Loading order" />
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>
      ) : null}

      {!loading && !error && !order ? (
        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          <Package className="h-9 w-9 text-[#D4C4B5]" />
          <p className="mt-3 text-sm text-[#6B5648]">No order details to show.</p>
        </div>
      ) : null}

      {!loading && !error && order ? (
        <div className="space-y-5">
          <DetailSection title="Order summary">
            <InfoRow label="Order" value={orderNumber(order.id)} />
            <InfoRow label="Placed" value={formatOrderDateTime(order.createdAt)} />
            <InfoRow label="Status" value={<StatusBadge status={order.status} />} />
            <InfoRow label="Customer" value={order.customerName} />
            <InfoRow label="Email" value={order.email} />
            {order.phone ? <InfoRow label="Phone" value={order.phone} /> : null}
          </DetailSection>

          {order.payment ? (
            <DetailSection title="Payment">
              <InfoRow label="Provider" value={order.payment.provider} />
              <InfoRow label="Status" value={order.payment.status} />
              <InfoRow
                label="Amount"
                value={`${formatMoney(order.payment.amount)} ${order.payment.currency}`}
              />
            </DetailSection>
          ) : null}

          <DetailSection title="Items">
            {order.items?.length ? (
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#FDEBDD]">
                      {item.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.productImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#C4A484]">
                          <Package size={18} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#3F2A18]">{item.productName}</p>
                      <p className="mt-0.5 text-xs text-[#9A8573]">
                        {item.quantity} × {formatMoney(item.unitPrice)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[#3F2A18]">
                      {formatMoney(item.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#6B5648]">No items on this order.</p>
            )}
          </DetailSection>

          <DetailSection title="Pricing">
            <PriceSummary subtotal={subtotal} total={order.total} />
          </DetailSection>

          <DetailSection title="Collection">
            <InfoRow label="Pickup date" value={order.pickupDate} />
            <InfoRow label="Pickup time" value={order.pickupTime} />
            {order.notes ? <InfoRow label="Notes" value={order.notes} /> : null}
          </DetailSection>
        </div>
      ) : null}
    </Modal>
  );
}
