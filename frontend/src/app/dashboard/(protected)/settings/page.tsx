"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Settings } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type SettingsForm = {
  "order.timezone": string;
  "order.cutoff_time": string;
  "order.min_lead_days": string;
};

const empty: SettingsForm = {
  "order.timezone": "Europe/London",
  "order.cutoff_time": "14:00",
  "order.min_lead_days": "1",
};

export default function SettingsPage() {
  const { toast, showToast, dismiss } = useToast();
  const [form, setForm] = useState<SettingsForm>(empty);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl("/api/settings"),
        withPermission("manage.settings", { credentials: "include" }),
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to load settings", "error");
        return;
      }
      const data = (await res.json()) as SettingsForm;
      setForm({ ...empty, ...data });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(
        apiUrl("/api/settings"),
        withPermission("manage.settings", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "order.timezone": form["order.timezone"].trim() || "Europe/London",
            "order.cutoff_time": form["order.cutoff_time"].trim(),
            "order.min_lead_days": form["order.min_lead_days"].trim(),
          }),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Update failed", "error");
        return;
      }
      setForm({ ...empty, ...(data as SettingsForm) });
      showToast("Settings saved", "success");
    } finally {
      setSubmitting(false);
    }
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

      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-peach/60 p-2 text-crust">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-crust-deep">Order settings</h1>
          <p className="mt-1 text-sm text-crust/70">
            Cut-off and lead times for pickup / delivery scheduling (Europe/London by default).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Timezone</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form["order.timezone"]}
            onChange={(e) => setForm((f) => ({ ...f, "order.timezone": e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cut-off time (24h HH:mm)
          </label>
          <input
            type="time"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form["order.cutoff_time"]}
            onChange={(e) => setForm((f) => ({ ...f, "order.cutoff_time": e.target.value }))}
            required
          />
          <p className="mt-1 text-xs text-crust/60">
            After this time, next-morning slots are skipped (lead + 1 day).
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Minimum lead days</label>
          <input
            type="number"
            min={0}
            max={14}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form["order.min_lead_days"]}
            onChange={(e) => setForm((f) => ({ ...f, "order.min_lead_days": e.target.value }))}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-crust px-5 py-2.5 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Save settings
        </button>
      </form>
    </section>
  );
}
