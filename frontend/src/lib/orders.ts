import { apiUrl, withPermission } from "@/lib/api";

export type OrderItem = {
  id: number;
  productId?: number | null;
  productName: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  productImage?: string | null;
};

export type OrderPayment = {
  status: string;
  provider: string;
  amount: string | number;
  currency: string;
};

export type Order = {
  id: number;
  userId?: string;
  customerName: string;
  email: string;
  phone: string | null;
  pickupDate: string;
  pickupTime: string;
  notes: string | null;
  total: string | number;
  currency?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  payment?: OrderPayment | null;
};

export type OrderStatusGroup = "pending" | "delivered" | "cancelled";

export function formatMoney(value: string | number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? `£${n.toFixed(2)}` : String(value);
}

export function orderNumber(id: number) {
  return `#HB-${id}`;
}

/** Map raw OrderStatus to UI filter / badge groups. */
export function toStatusGroup(status: string): OrderStatusGroup {
  if (status === "completed") return "delivered";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

export function formatOrderDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} • ${time}`;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(apiUrl("/api/orders"), { credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to load orders");
  }
  const data = (await res.json()) as Order[];
  return Array.isArray(data) ? data : [];
}

export async function fetchOrderById(id: number): Promise<Order> {
  const res = await fetch(
    apiUrl(`/api/orders/${id}`),
    withPermission("view.orders", { credentials: "include" }),
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to load order");
  }
  return (await res.json()) as Order;
}
