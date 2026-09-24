"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  CheckCircle2,
  Trash2,
  ShoppingBasket,
  Mail,
  Loader2,
  RefreshCw,
  Search,
  DollarSign,
  Package,
  Calendar,
  Phone,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { apiUrl, withPermission } from "@/lib/api";

type OrderItemInfo = {
  id?: number;
  productName?: string;
  name?: string;
  unitPrice?: string | number;
  price?: string | number;
  quantity?: number;
  qty?: number;
};

type OrderType = {
  id: number;
  customerName: string;
  email: string;
  phone: string | null;
  pickupDate: string;
  pickupTime: string;
  notes: string | null;
  total: string;
  status: string;
  createdAt: string;
  items?: OrderItemInfo[];
};

type MessageType = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "messages">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(
        apiUrl("/api/orders"),
        withPermission("view.orders", { credentials: "include" }),
      );
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch(
        apiUrl("/api/messages"),
        withPermission("view.messages", { credentials: "include" }),
      );
      if (res.ok) setMessages(await res.json());
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
        if (!me.ok) return;
        const data = await me.json();
        const permissions: string[] = data.permissions ?? [];
        if (!cancelled && !permissions.includes("view.orders")) {
          window.location.replace("/dashboard/my-orders");
          return;
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) {
        void fetchOrders();
        void fetchMessages();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setProcessingId(orderId);
    try {
      const res = await fetch(
        apiUrl(`/api/orders/${orderId}`),
        withPermission("view.orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }),
      );
      if (res.ok) setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setProcessingId(orderId);
    try {
      const res = await fetch(
        apiUrl(`/api/orders/${orderId}`),
        withPermission("view.orders", { method: "DELETE", credentials: "include" }),
      );
      if (res.ok) setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const res = await fetch(
      apiUrl(`/api/messages/${msgId}`),
      withPermission("view.messages", { method: "DELETE", credentials: "include" }),
    );
    if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const activeRevenue = orders.filter((o) => o.status !== "completed").reduce((sum, o) => sum + parseFloat(o.total), 0);
  const totalCompletedRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + parseFloat(o.total), 0);

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const matchesStatus = statusFilter === "all" || o.status === statusFilter;
        const matchesSearch =
          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.phone && o.phone.includes(searchQuery));
        return matchesStatus && matchesSearch;
      }),
    [orders, searchQuery, statusFilter],
  );

  const formatOrderItems = (items?: OrderItemInfo[]) =>
    (items ?? []).map((item, idx) => {
      const name = item.productName ?? item.name ?? "Item";
      const qty = item.quantity ?? item.qty ?? 1;
      const price = Number(item.unitPrice ?? item.price ?? 0);
      return (
        <div key={idx} className="flex justify-between text-sm">
          <span className="text-crust-deep/80">
            {qty} x {name}
          </span>
          <span className="font-semibold">£{(price * qty).toFixed(2)}</span>
        </div>
      );
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-crust/10 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-honey/15 px-3 py-1 text-xs font-bold text-crust-dark">
            <ShieldCheck size={12} /> Authenticated Admin
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-crust-deep sm:text-4xl">Bakery Control Center</h1>
          <p className="text-sm text-crust/70">Manage live orders, pickup schedules and guest messages.</p>
        </div>
        <button
          onClick={() => {
            void fetchOrders();
            void fetchMessages();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-crust/10 bg-white text-crust hover:bg-warm transition"
          title="Refresh database records"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Active Basket Orders</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-honey/10 text-honey">
              <ShoppingBasket size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-crust-deep">{pendingOrders.length + preparingOrders.length + readyOrders.length}</p>
        </div>
        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Active Revenue (Uncollected)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600">
              <DollarSign size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-700">£{activeRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Completed Collections</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-700">{completedOrders.length}</p>
          <p className="mt-2 text-xs text-crust/60">Collected value: <span className="font-semibold text-blue-600">£{totalCompletedRevenue.toFixed(2)}</span></p>
        </div>
        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Guest Messages</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Mail size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-700">{messages.length}</p>
        </div>
      </div>

      <div className="mt-8 flex border-b border-crust/10">
        <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold ${activeTab === "orders" ? "border-crust text-crust-deep" : "border-transparent text-crust/60"}`}>
          <Package size={18} /> Live Orders
        </button>
        <button onClick={() => setActiveTab("messages")} className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold ${activeTab === "messages" ? "border-crust text-crust-deep" : "border-transparent text-crust/60"}`}>
          <MessageSquare size={18} /> Contact Messages
        </button>
      </div>

      {activeTab === "orders" ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warm p-4">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Orders", count: orders.length },
                { id: "pending", label: "Pending", count: pendingOrders.length },
                { id: "preparing", label: "Preparing", count: preparingOrders.length },
                { id: "ready", label: "Ready", count: readyOrders.length },
                { id: "completed", label: "Completed", count: completedOrders.length },
              ].map((f) => (
                <button key={f.id} onClick={() => setStatusFilter(f.id)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${statusFilter === f.id ? "bg-crust text-white" : "bg-white text-crust"}`}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-xs sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-crust/50" size={16} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search orders..." className="w-full rounded-xl border border-crust/10 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-crust" />
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto animate-spin text-crust" size={32} />
              <p className="mt-2 text-sm text-crust/70">Syncing with live orders database...</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="overflow-hidden rounded-2xl border border-crust/15 bg-white shadow-sm transition hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-crust/10 bg-cream/40 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-bold text-crust-deep">#{order.id}</span>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800">{order.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-crust/60">
                      <Calendar size={13} />
                      <span>Placed: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>

                  <div className="grid gap-6 p-5 sm:grid-cols-3 sm:p-6">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-crust/60">Customer Details</h4>
                      <p className="mt-2 font-display text-base font-bold text-crust-deep">{order.customerName}</p>
                      <p className="text-sm text-crust-deep/80">{order.email}</p>
                      {order.phone && <p className="mt-1 flex items-center gap-1.5 text-sm text-crust-deep/70"><Phone size={13} /> {order.phone}</p>}
                      <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-warm px-3 py-1.5 text-xs font-bold text-crust-dark">
                        <Clock size={13} />
                        Pickup: {order.pickupDate} @ {order.pickupTime}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-crust/60">Items & Baker Notes</h4>
                      <div className="mt-2 space-y-1.5">
                        {formatOrderItems(order.items)}
                        <div className="border-t border-crust/10 pt-2 flex justify-between text-sm font-bold">
                          <span>Total Due</span>
                          <span className="text-base text-crust-dark">£{parseFloat(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                      {order.notes && <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50/50 p-2.5 text-xs text-crust-deep/80"><span className="font-bold">Staff Note:</span> {order.notes}</div>}
                    </div>

                    <div className="flex flex-col justify-between sm:items-end">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-crust/60">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {order.status !== "preparing" && order.status !== "ready" && order.status !== "completed" && <button disabled={processingId === order.id} onClick={() => void handleUpdateStatus(order.id, "preparing")} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">Start Prep</button>}
                          {order.status !== "ready" && order.status !== "completed" && <button disabled={processingId === order.id} onClick={() => void handleUpdateStatus(order.id, "ready")} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white">Mark Ready</button>}
                          {order.status !== "completed" && <button disabled={processingId === order.id} onClick={() => void handleUpdateStatus(order.id, "completed")} className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white">Collect & Complete</button>}
                        </div>
                      </div>
                      <button disabled={processingId === order.id} onClick={() => void handleDeleteOrder(order.id)} className="mt-4 flex items-center gap-1.5 self-start text-xs font-semibold text-red-600 hover:text-red-800 transition sm:self-auto">
                        <Trash2 size={13} /> Cancel/Delete Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          {loadingMessages ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto animate-spin text-crust" size={32} />
              <p className="mt-2 text-sm text-crust/70">Syncing with contact message database...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {messages.map((m) => (
                <div key={m.id} className="flex flex-col justify-between rounded-2xl border border-crust/10 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font--semibold text-crust/60">From: <span className="font-bold text-crust-deep">{m.name}</span> ({m.email})</p>
                        <p className="mt-1 font-display text-lg font-bold text-crust-deep">{m.subject}</p>
                      </div>
                      <span className="text-[11px] text-crust/50">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-line rounded-xl border border-crust/5 bg-cream/30 p-3 text-sm leading-relaxed text-crust-deep/80">{m.message}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-crust/10 pt-3">
                    <a href={`mailto:${m.email}?subject=RE: ${m.subject}`} className="text-xs font-bold text-crust hover:text-crust-dark">Reply by Email →</a>
                    <button onClick={() => void handleDeleteMessage(m.id)} className="text-red-500 hover:text-red-700 transition" title="Delete log">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
