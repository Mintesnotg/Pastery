"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  Trash2,
  ShoppingBasket,
  Mail,
  Loader2,
  RefreshCw,
  Sparkles,
  Search,
  Lock,
  DollarSign,
  Package,
  Calendar,
  Phone,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { BreadSlice } from "@/components/BreadSlice";

type OrderItemInfo = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type OrderType = {
  id: number;
  customerName: string;
  email: string;
  phone: string | null;
  pickupDate: string;
  pickupTime: string;
  notes: string | null;
  items: string; // JSON string of OrderItemInfo[]
  total: string;
  status: string;
  createdAt: string;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "messages">("orders");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [processingId, setProcessingId] = useState<number | null>(null);

  // Authenticate with a simple default pin "admin123" (good for demonstration and protection)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "admin123" || pin === "bread") {
      setIsAuthenticated(true);
      localStorage.setItem("hob_admin_authenticated", "true");
    } else {
      setLoginError("Incorrect staff pin code. Hint: use 'bread' or 'admin123'");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("hob_admin_authenticated") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Failed to load messages:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchMessages();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("hob_admin_authenticated");
  };

  // Calculations for stats
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const activeRevenue = orders
    .filter((o) => o.status !== "completed")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  const totalCompletedRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.phone && o.phone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const parseOrderItems = (itemsStr: string): OrderItemInfo[] => {
    try {
      return JSON.parse(itemsStr);
    } catch {
      return [];
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24">
        <div className="w-full rounded-3xl border border-crust/10 bg-white p-8 shadow-xl">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warm text-crust">
              <Lock size={26} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold text-crust-deep">
              Staff Portal
            </h1>
            <p className="mt-1 text-sm text-crust/70">
              House of Bread London Admin Dashboard
            </p>
            <BreadSlice className="mx-auto mt-2 h-6 w-16 text-honey" />
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-crust/70">
                Staff PIN / Access Code
              </label>
              <input
                required
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter access code (hint: bread)"
                className="mt-1.5 w-full rounded-xl border border-crust/15 bg-cream/50 px-4 py-3 text-center text-lg font-bold tracking-widest outline-none transition focus:border-crust focus:ring-2 focus:ring-honey/40"
              />
            </div>
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-crust py-3 font-semibold text-white transition hover:bg-crust-dark"
            >
              Access Dashboard <ArrowRight size={16} />
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-crust/50">
            Authorized personnel only. Logs are kept for security audits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-crust/10 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-honey/15 px-3 py-1 text-xs font-bold text-crust-dark">
            <Sparkles size={12} /> Live Backend Connected
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold text-crust-deep sm:text-4xl">
            Bakery Control Center
          </h1>
          <p className="text-sm text-crust/70">
            Manage live orders, pickup schedules and guest messages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchOrders();
              fetchMessages();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-crust/10 bg-white text-crust hover:bg-warm transition"
            title="Refresh database records"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Active Basket Orders</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-honey/10 text-honey">
              <ShoppingBasket size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-crust-deep">
            {pendingOrders.length + preparingOrders.length + readyOrders.length}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-crust/60">
            <span className="font-semibold text-yellow-600">{pendingOrders.length} pending</span> ·{" "}
            <span className="font-semibold text-blue-600">{preparingOrders.length} preparing</span>
          </div>
        </div>

        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Active Revenue (Uncollected)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600">
              <DollarSign size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-700">£{activeRevenue.toFixed(2)}</p>
          <p className="mt-2 text-xs text-crust/60">Calculated from uncollected orders</p>
        </div>

        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Completed Collections</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-700">{completedOrders.length}</p>
          <p className="mt-2 text-xs text-crust/60">
            Collected value: <span className="font-semibold text-blue-600">£{totalCompletedRevenue.toFixed(2)}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-crust/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-crust/70">Guest Messages</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Mail size={18} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-700">{messages.length}</p>
          <p className="mt-2 text-xs text-crust/60">Submissions from contact form</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-crust/10">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold transition ${
            activeTab === "orders"
              ? "border-crust text-crust-deep"
              : "border-transparent text-crust/60 hover:text-crust"
          }`}
        >
          <Package size={18} /> Live Orders
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 font-semibold transition ${
            activeTab === "messages"
              ? "border-crust text-crust-deep"
              : "border-transparent text-crust/60 hover:text-crust"
          }`}
        >
          <MessageSquare size={18} /> Contact Messages
        </button>
      </div>

      {activeTab === "orders" ? (
        <div className="mt-6">
          {/* Order filters and Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warm p-4">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Orders", count: orders.length },
                { id: "pending", label: "Pending", count: pendingOrders.length, color: "bg-amber-100 text-amber-800" },
                { id: "preparing", label: "Preparing", count: preparingOrders.length, color: "bg-blue-100 text-blue-800" },
                { id: "ready", label: "Ready", count: readyOrders.length, color: "bg-green-100 text-green-800" },
                { id: "completed", label: "Completed", count: completedOrders.length, color: "bg-slate-100 text-slate-800" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    statusFilter === f.id
                      ? "bg-crust text-white"
                      : "bg-white text-crust hover:bg-cream"
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-xs sm:w-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-crust/50" size={16} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full rounded-xl border border-crust/10 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-crust"
              />
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto animate-spin text-crust" size={32} />
              <p className="mt-2 text-sm text-crust/70">Syncing with live orders database…</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-crust/20 bg-white py-16 text-center text-crust/50">
              <ShoppingBasket size={36} className="mx-auto text-crust/20" />
              <p className="mt-2 text-lg font-bold">No orders found</p>
              <p className="text-sm">Try changing filters or search query.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredOrders.map((order) => {
                const itemsList = parseOrderItems(order.items);
                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-crust/15 bg-white shadow-sm transition hover:shadow-md"
                  >
                    {/* Order bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-crust/10 bg-cream/40 px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-lg font-bold text-crust-deep">
                          #{order.id}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                            order.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : order.status === "preparing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "ready"
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-crust/60">
                        <Calendar size={13} />
                        <span>Placed: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="grid gap-6 p-5 sm:grid-cols-3 sm:p-6">
                      {/* Customer details */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-crust/60">
                          Customer Details
                        </h4>
                        <p className="mt-2 font-display text-base font-bold text-crust-deep">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-crust-deep/80">{order.email}</p>
                        {order.phone && (
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-crust-deep/70">
                            <Phone size={13} /> {order.phone}
                          </p>
                        )}
                        <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-warm px-3 py-1.5 text-xs font-bold text-crust-dark">
                          <Clock size={13} />
                          Pickup: {order.pickupDate} @ {order.pickupTime}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-crust/60">
                          Items & Baker Notes
                        </h4>
                        <div className="mt-2 space-y-1.5">
                          {itemsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-crust-deep/80">
                                {item.qty} × {item.name}
                              </span>
                              <span className="font-semibold">
                                £{(item.price * item.qty).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-crust/10 pt-2 flex justify-between text-sm font-bold">
                            <span>Total Due</span>
                            <span className="text-base text-crust-dark">£{parseFloat(order.total).toFixed(2)}</span>
                          </div>
                        </div>
                        {order.notes && (
                          <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50/50 p-2.5 text-xs text-crust-deep/80">
                            <span className="font-bold">Staff Note:</span> {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-between sm:items-end">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-crust/60 uppercase">Update Status</p>
                          <div className="flex flex-wrap gap-2">
                            {order.status !== "preparing" && order.status !== "ready" && order.status !== "completed" && (
                              <button
                                disabled={processingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, "preparing")}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700"
                              >
                                Start Prep
                              </button>
                            )}
                            {order.status !== "ready" && order.status !== "completed" && (
                              <button
                                disabled={processingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, "ready")}
                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-700"
                              >
                                Mark Ready
                              </button>
                            )}
                            {order.status !== "completed" && (
                              <button
                                disabled={processingId === order.id}
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                                className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                              >
                                Collect & Complete
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          disabled={processingId === order.id}
                          onClick={() => handleDeleteOrder(order.id)}
                          className="mt-4 flex items-center gap-1.5 self-start text-xs font-semibold text-red-600 hover:text-red-800 transition sm:self-auto"
                        >
                          <Trash2 size={13} /> Cancel/Delete Order
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6">
          {loadingMessages ? (
            <div className="py-20 text-center">
              <Loader2 className="mx-auto animate-spin text-crust" size={32} />
              <p className="mt-2 text-sm text-crust/70">Syncing with contact message database…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-crust/20 bg-white py-16 text-center text-crust/50">
              <Mail size={36} className="mx-auto text-crust/20" />
              <p className="mt-2 text-lg font-bold">No messages yet</p>
              <p className="text-sm">Guest submissions will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col justify-between rounded-2xl border border-crust/10 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-crust/60">
                          From: <span className="font-bold text-crust-deep">{m.name}</span> ({m.email})
                        </p>
                        <p className="mt-1 font-display text-lg font-bold text-crust-deep">
                          {m.subject}
                        </p>
                      </div>
                      <span className="text-[11px] text-crust/50">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-crust-deep/80 whitespace-pre-line bg-cream/30 p-3 rounded-xl border border-crust/5">
                      {m.message}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-crust/10 pt-3">
                    <a
                      href={`mailto:${m.email}?subject=RE: ${m.subject}`}
                      className="text-xs font-bold text-crust hover:text-crust-dark"
                    >
                      Reply by Email →
                    </a>
                    <button
                      onClick={() => handleDeleteMessage(m.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Delete log"
                    >
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
