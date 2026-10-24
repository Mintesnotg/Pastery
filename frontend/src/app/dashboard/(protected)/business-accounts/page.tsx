"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Loader2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type BusinessAccount = {
  id: number;
  business_name: string;
  city: string;
  postcode: string;
  approval_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  credit_tier: number;
  credit_limit: number;
  credit_balance: number;
  overdue_paused: boolean;
  has_business_id_doc: boolean;
  has_license_doc: boolean;
  created_at: string;
  contact_user?: { id: string; email: string; full_name: string };
};

type Paginated = {
  data: BusinessAccount[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ReviewForm = {
  approval_status: "approved" | "rejected";
  credit_tier: string;
  credit_limit: string;
  rejection_reason: string;
  overdue_paused: boolean;
};

const PAGE_SIZE = 20;

const emptyReview: ReviewForm = {
  approval_status: "approved",
  credit_tier: "0",
  credit_limit: "0",
  rejection_reason: "",
  overdue_paused: false,
};

export default function BusinessAccountsAdminPage() {
  const { toast, showToast, dismiss } = useToast();
  const [rows, setRows] = useState<BusinessAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<BusinessAccount | null>(null);
  const [form, setForm] = useState<ReviewForm>(emptyReview);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(
    async (p: number, status: string) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
        if (status) qs.set("status", status);
        const res = await fetch(
          apiUrl(`/api/business-accounts?${qs}`),
          withPermission("view.business_accounts", { credentials: "include" }),
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          showToast((data as { error?: string }).error ?? "Failed to load accounts", "error");
          return;
        }
        const json: Paginated = await res.json();
        setRows(json.data);
        setTotal(json.total);
        setPage(json.page);
        setTotalPages(json.totalPages);
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchList(1, statusFilter);
  }, [fetchList, statusFilter]);

  const openReview = (account: BusinessAccount) => {
    setSelected(account);
    setForm({
      approval_status: account.approval_status === "rejected" ? "rejected" : "approved",
      credit_tier: String(account.credit_tier ?? 0),
      credit_limit: String(account.credit_limit ?? 0),
      rejection_reason: account.rejection_reason ?? "",
      overdue_paused: account.overdue_paused,
    });
  };

  const downloadDoc = async (id: number, kind: "business-id" | "license") => {
    const res = await fetch(
      apiUrl(`/api/business-accounts/${id}/documents/${kind}`),
      withPermission("view.business_accounts", { credentials: "include" }),
    );
    if (!res.ok) {
      showToast("Document download failed", "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-${id}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (form.approval_status === "rejected" && !form.rejection_reason.trim()) {
      showToast("Rejection reason is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        approval_status: form.approval_status,
        overdue_paused: form.overdue_paused,
      };
      if (form.approval_status === "approved") {
        body.credit_tier = Number(form.credit_tier);
        body.credit_limit = Number(form.credit_limit);
      } else {
        body.rejection_reason = form.rejection_reason.trim();
      }

      const res = await fetch(
        apiUrl(`/api/business-accounts/${selected.id}`),
        withPermission("approve.business_account", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Update failed", "error");
        return;
      }
      showToast(
        form.approval_status === "approved" ? "Account approved" : "Account rejected",
        "success",
      );
      setSelected(null);
      fetchList(page, statusFilter);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<BusinessAccount>[]>(
    () => [
      {
        accessorKey: "business_name",
        header: "Business",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-crust-deep">{row.original.business_name}</div>
            <div className="text-xs text-crust/60">{row.original.contact_user?.email}</div>
          </div>
        ),
      },
      {
        id: "location",
        header: "Location",
        cell: ({ row }) => `${row.original.city}, ${row.original.postcode}`,
      },
      {
        accessorKey: "approval_status",
        header: "Status",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.approval_status}</span>
        ),
      },
      {
        accessorKey: "credit_tier",
        header: "Tier",
        cell: ({ row }) =>
          row.original.approval_status === "approved" ? row.original.credit_tier : "—",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openReview(row.original)}
            className="rounded-lg border border-crust/20 px-3 py-1.5 text-xs font-semibold text-crust hover:bg-peach/40"
          >
            Review
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <section className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-crust-deep">Cafe accounts</h1>
          <p className="mt-1 text-sm text-crust/70">
            Review applications, set credit tier, and manage cafe accounts.
          </p>
        </div>
        <label className="text-sm text-crust/70">
          Status{" "}
          <select
            className="ml-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        searchPlaceholder="Search…"
        pageSize={PAGE_SIZE}
        emptyMessage={loading ? "Loading…" : "No cafe accounts found."}
        manualPagination
        pageCount={totalPages}
        pageIndex={page - 1}
        onPageChange={(idx) => fetchList(idx + 1, statusFilter)}
        totalRows={total}
      />

      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? `Review: ${selected.business_name}` : "Review"}
      >
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="text-sm text-crust/70">
              Contact: {selected.contact_user?.full_name} ({selected.contact_user?.email})
            </p>

            <div className="flex flex-wrap gap-2">
              {selected.has_business_id_doc && (
                <button
                  type="button"
                  onClick={() => downloadDoc(selected.id, "business-id")}
                  className="inline-flex items-center gap-1 rounded-lg border border-crust/20 px-3 py-1.5 text-xs font-medium text-crust hover:bg-peach/30"
                >
                  <Download className="h-3.5 w-3.5" /> Business ID
                </button>
              )}
              {selected.has_license_doc && (
                <button
                  type="button"
                  onClick={() => downloadDoc(selected.id, "license")}
                  className="inline-flex items-center gap-1 rounded-lg border border-crust/20 px-3 py-1.5 text-xs font-medium text-crust hover:bg-peach/30"
                >
                  <Download className="h-3.5 w-3.5" /> License
                </button>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Decision</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={form.approval_status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    approval_status: e.target.value as "approved" | "rejected",
                  }))
                }
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>

            {form.approval_status === "approved" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Credit tier</label>
                    <select
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={form.credit_tier}
                      onChange={(e) => setForm((f) => ({ ...f, credit_tier: e.target.value }))}
                    >
                      <option value="0">0 — Prepaid</option>
                      <option value="1">1 — Net 7</option>
                      <option value="2">2 — Net 14</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Credit limit (£)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={form.credit_limit}
                      onChange={(e) => setForm((f) => ({ ...f, credit_limit: e.target.value }))}
                    />
                  </div>
                </div>
                <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={form.overdue_paused}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, overdue_paused: e.target.checked }))
                    }
                  />
                  <span>
                    <span className="font-medium">Pause ordering (overdue)</span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      Blocks new wholesale orders until cleared.
                    </span>
                  </span>
                </label>
              </>
            ) : (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Rejection reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.rejection_reason}
                  onChange={(e) => setForm((f) => ({ ...f, rejection_reason: e.target.value }))}
                />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg bg-crust px-5 py-2 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save decision
              </button>
            </div>
          </form>
        )}
      </Modal>
    </section>
  );
}
