"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Paginated = {
  data: Category[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type Form = {
  name: string;
  description: string;
  is_active: boolean;
};

type FormErrors = Partial<Record<keyof Form, string>>;

const emptyForm: Form = { name: "", description: "", is_active: true };
const PAGE_SIZE = 20;

export default function ProductCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, dismiss } = useToast();

  const fetchRows = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          apiUrl(`/api/product-categories/admin?page=${p}&pageSize=${PAGE_SIZE}`),
          withPermission("view.product_category", { credentials: "include" }),
        );
        if (res.ok) {
          const json: Paginated = await res.json();
          setRows(json.data);
          setTotal(json.total);
          setTotalPages(json.totalPages);
          setPage(json.page);
        } else {
          const data = await res.json().catch(() => ({}));
          showToast((data as { error?: string }).error ?? "Failed to load categories.", "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    void fetchRows(1);
  }, [fetchRows]);

  const openCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setSelected(null);
    setModalMode("create");
  };

  const openEdit = useCallback((row: Category) => {
    setForm({
      name: row.name,
      description: row.description ?? "",
      is_active: row.is_active,
    });
    setFormErrors({});
    setSelected(row);
    setModalMode("edit");
  }, []);

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: FormErrors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      const isEdit = modalMode === "edit";
      const res = await fetch(
        isEdit ? apiUrl(`/api/product-categories/${selected!.id}`) : apiUrl("/api/product-categories"),
        withPermission(isEdit ? "update.product_category" : "create.product_category", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description.trim() || null,
            is_active: form.is_active,
          }),
        }),
      );
      if (res.ok) {
        showToast(isEdit ? "Category updated." : "Category created.", "success");
        closeModal();
        void fetchRows(page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Request failed.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        apiUrl(`/api/product-categories/${deleteTarget.id}`),
        withPermission("delete.product_category", { method: "DELETE", credentials: "include" }),
      );
      if (res.ok || res.status === 204) {
        showToast("Category deactivated.", "success");
        setDeleteTarget(null);
        void fetchRows(page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to deactivate.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => row.original.description || "—",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => openEdit(row.original)}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
              disabled={!row.original.is_active}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [openEdit],
  );

  return (
    <section className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-crust-deep">Categories</h1>
        <p className="mt-1 text-sm text-crust/70">Manage product categories for the storefront.</p>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        searchPlaceholder="Search categories..."
        pageSize={PAGE_SIZE}
        toolbar={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white hover:bg-crust-deep"
          >
            + Create Category
          </button>
        }
        emptyMessage={loading ? "Loading…" : "No categories found."}
        manualPagination
        pageCount={totalPages}
        pageIndex={page - 1}
        onPageChange={(idx) => void fetchRows(idx + 1)}
        totalRows={total}
      />

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Category" : "Create Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                formErrors.name
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-blue-500/20"
              }`}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeModal} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Saving…" : modalMode === "edit" ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Deactivate category">
        <p className="text-sm text-gray-600">
          Soft-delete <strong>{deleteTarget?.name}</strong>?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleDelete()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Deactivating…" : "Deactivate"}
          </button>
        </div>
      </Modal>
    </section>
  );
}
