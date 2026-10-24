"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Repeat } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";
import { getProducts, type StoreProduct } from "@/lib/products";

type StandingItem = {
  id?: number;
  product_id: number;
  quantity: number;
  product_name?: string | null;
  wholesale_price?: number | null;
};

type StandingOrder = {
  id: number;
  weekdays: number[];
  fulfillment_type: "pickup" | "delivery";
  delivery_address: string | null;
  preferred_time: string;
  notes: string | null;
  active: boolean;
  items: StandingItem[];
  business_account?: { id: number; business_name: string };
};

type FormState = {
  weekdays: number[];
  fulfillment_type: "pickup" | "delivery";
  delivery_address: string;
  preferred_time: string;
  notes: string;
  active: boolean;
  items: { product_id: number; quantity: number }[];
};

const WEEKDAY_LABELS: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

const emptyForm: FormState = {
  weekdays: [1, 2, 3, 4, 5],
  fulfillment_type: "pickup",
  delivery_address: "",
  preferred_time: "08:00",
  notes: "",
  active: true,
  items: [{ product_id: 0, quantity: 1 }],
};

function formatWeekdays(days: number[]) {
  const set = new Set(days);
  return WEEKDAY_LABELS.filter((d) => set.has(d.value))
    .map((d) => d.label)
    .join(", ");
}

export default function CafeStandingOrdersPage() {
  const { toast, showToast, dismiss } = useToast();
  const [rows, setRows] = useState<StandingOrder[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StandingOrder | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const wholesaleProducts = useMemo(
    () => products.filter((p) => p.wholesalePrice != null),
    [products],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, productList] = await Promise.all([
        fetch(
          apiUrl("/api/standing-orders"),
          withPermission("create.standing_order", { credentials: "include" }),
        ),
        getProducts(),
      ]);
      setProducts(productList);
      if (!listRes.ok) {
        const data = await listRes.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to load standing orders", "error");
        return;
      }
      setRows(await listRes.json());
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      items: [
        {
          product_id: wholesaleProducts[0]?.id ?? 0,
          quantity: 1,
        },
      ],
    });
    setModalOpen(true);
  };

  const openEdit = (row: StandingOrder) => {
    setEditing(row);
    setForm({
      weekdays: [...row.weekdays],
      fulfillment_type: row.fulfillment_type,
      delivery_address: row.delivery_address ?? "",
      preferred_time: row.preferred_time,
      notes: row.notes ?? "",
      active: row.active,
      items: row.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    });
    setModalOpen(true);
  };

  const toggleWeekday = (day: number) => {
    setForm((f) => {
      const has = f.weekdays.includes(day);
      const weekdays = has ? f.weekdays.filter((d) => d !== day) : [...f.weekdays, day].sort();
      return { ...f, weekdays };
    });
  };

  const setItem = (index: number, patch: Partial<{ product_id: number; quantity: number }>) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addItem = () => {
    setForm((f) => ({
      ...f,
      items: [
        ...f.items,
        { product_id: wholesaleProducts[0]?.id ?? 0, quantity: 1 },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setForm((f) => ({
      ...f,
      items: f.items.length <= 1 ? f.items : f.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weekdays.length) {
      showToast("Select at least one weekday", "error");
      return;
    }
    if (form.items.some((i) => !i.product_id || i.quantity < 1)) {
      showToast("Each line needs a product and quantity", "error");
      return;
    }
    if (form.fulfillment_type === "delivery" && !form.delivery_address.trim()) {
      showToast("Delivery address is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        weekdays: form.weekdays,
        fulfillment_type: form.fulfillment_type,
        delivery_address:
          form.fulfillment_type === "delivery" ? form.delivery_address.trim() : null,
        preferred_time: form.preferred_time,
        notes: form.notes.trim() || null,
        active: form.active,
        items: form.items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch(
        apiUrl(editing ? `/api/standing-orders/${editing.id}` : "/api/standing-orders"),
        withPermission("create.standing_order", {
          method: editing ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Save failed", "error");
        return;
      }
      showToast(editing ? "Standing order updated" : "Standing order created", "success");
      setModalOpen(false);
      void load();
    } finally {
      setSubmitting(false);
    }
  };

  const deactivate = async (row: StandingOrder) => {
    const res = await fetch(
      apiUrl(`/api/standing-orders/${row.id}`),
      withPermission("create.standing_order", {
        method: "DELETE",
        credentials: "include",
      }),
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showToast((data as { error?: string }).error ?? "Deactivate failed", "error");
      return;
    }
    showToast("Standing order deactivated", "success");
    void load();
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center rounded-2xl border border-crust/10 bg-white p-12 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-crust" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-peach/60 p-2 text-crust">
            <Repeat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-crust-deep">Standing orders</h1>
            <p className="mt-1 text-sm text-crust/70">
              Recurring wholesale templates. Ops generates them into real orders on matching days.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white hover:bg-crust-deep"
        >
          <Plus className="h-4 w-4" />
          New standing order
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-crust/20 bg-cream/40 px-4 py-8 text-center text-sm text-crust/70">
          No standing orders yet. Create one for the weekdays you need bread delivered or ready for
          pickup.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-crust/10 text-xs uppercase tracking-wide text-crust/60">
              <tr>
                <th className="px-3 py-2 font-medium">Days</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Fulfillment</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-crust/5">
                  <td className="px-3 py-3 text-crust-deep">{formatWeekdays(row.weekdays)}</td>
                  <td className="px-3 py-3">{row.preferred_time}</td>
                  <td className="px-3 py-3 capitalize">
                    {row.fulfillment_type}
                    {row.fulfillment_type === "delivery" && row.delivery_address ? (
                      <div className="mt-0.5 max-w-xs truncate text-xs text-crust/55">
                        {row.delivery_address}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    {row.items.map((i) => (
                      <div key={`${row.id}-${i.product_id}`}>
                        {i.quantity}× {i.product_name ?? `#${i.product_id}`}
                      </div>
                    ))}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      type="button"
                      className="mr-2 text-sm font-medium text-crust hover:underline"
                      onClick={() => openEdit(row)}
                    >
                      Edit
                    </button>
                    {row.active ? (
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600 hover:underline"
                        onClick={() => void deactivate(row)}
                      >
                        Deactivate
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit standing order" : "New standing order"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-crust/20 px-4 py-2 text-sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="standing-order-form"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </button>
          </div>
        }
      >
        <form id="standing-order-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Weekdays</p>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((d) => {
                const on = form.weekdays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleWeekday(d.value)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      on ? "bg-crust text-white" : "bg-cream text-crust"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Preferred time</label>
              <input
                type="time"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.preferred_time}
                onChange={(e) => setForm((f) => ({ ...f, preferred_time: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fulfillment</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.fulfillment_type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    fulfillment_type: e.target.value as "pickup" | "delivery",
                  }))
                }
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>

          {form.fulfillment_type === "delivery" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Delivery address
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows={2}
                value={form.delivery_address}
                onChange={(e) => setForm((f) => ({ ...f, delivery_address: e.target.value }))}
                required
              />
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {editing ? (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Active
            </label>
          ) : null}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Products</p>
              <button
                type="button"
                onClick={addItem}
                className="text-sm font-medium text-crust hover:underline"
              >
                Add line
              </button>
            </div>
            {wholesaleProducts.length === 0 ? (
              <p className="text-sm text-red-600">No products with wholesale prices available.</p>
            ) : (
              <div className="space-y-2">
                {form.items.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-2">
                    <select
                      className="min-w-48 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={item.product_id || ""}
                      onChange={(e) => setItem(index, { product_id: Number(e.target.value) })}
                      required
                    >
                      <option value="" disabled>
                        Select product
                      </option>
                      {wholesaleProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (£{p.wholesalePrice?.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={item.quantity}
                      onChange={(e) => setItem(index, { quantity: Number(e.target.value) || 1 })}
                      required
                    />
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </section>
  );
}
