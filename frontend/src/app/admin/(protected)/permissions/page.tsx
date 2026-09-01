"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type Permission = {
  id: number;
  key: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

type PaginatedPermissions = {
  data: Permission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type PermissionForm = { key: string; name: string; description: string };

const emptyForm: PermissionForm = { key: "", name: "", description: "" };
const PAGE_SIZE = 20;

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
  const [form, setForm] = useState<PermissionForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<PermissionForm>>({});
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, dismiss } = useToast();

  const fetchPermissions = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/permissions?page=${p}&pageSize=${PAGE_SIZE}`),
        withPermission("view.permissions", { credentials: "include" }),
      );
      if (res.ok) {
        const json: PaginatedPermissions = await res.json();
        setPermissions(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        setPage(json.page);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(1); }, [fetchPermissions]);

  const validate = (): boolean => {
    const errors: Partial<PermissionForm> = {};
    if (!form.key.trim()) errors.key = "Key is required";
    if (!form.name.trim()) errors.name = "Name is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = useCallback(() => {
    setForm(emptyForm);
    setFormErrors({});
    setSelectedPermission(null);
    setModalMode("create");
  }, []);

  const openEditModal = useCallback((permission: Permission) => {
    setForm({ key: permission.key, name: permission.name, description: permission.description ?? "" });
    setFormErrors({});
    setSelectedPermission(permission);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedPermission(null);
    setForm(emptyForm);
    setFormErrors({});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const isEdit = modalMode === "edit";
      const permissionname = isEdit? "edit.permission" : "create.permission";
      const url = isEdit
        ? apiUrl(`/api/permissions/${selectedPermission!.id}`)
        : apiUrl("/api/permissions");
      const res = await fetch(
        url,
        withPermission(permissionname, {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            key: form.key.trim(),
            name: form.name.trim(),
            description: form.description.trim() || null,
          }),
        }),
      );
      if (res.ok) {
        showToast(isEdit ? "Permission updated successfully." : "Permission created successfully.", "success");
        closeModal();
        fetchPermissions(page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "An error occurred. Please try again.", "error");
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
        apiUrl(`/api/permissions/${deleteTarget.id}`),
        withPermission("delete.permission", { method: "DELETE", credentials: "include" }),
      );
      if (res.ok) {
        showToast("Permission deactivated successfully.", "success");
        setDeleteTarget(null);
        fetchPermissions(page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to deactivate permission.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<Permission>[]>(
    () => [
      {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-crust-deep">{row.original.key}</span>
        ),
      },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) =>
          row.original.description ? (
            <span className="text-gray-600">{row.original.description}</span>
          ) : (
            <span className="text-gray-300">—</span>
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {row.original.status === "ACTIVE" ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },

      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => openEditModal(row.original)}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 hover:text-crust transition-colors"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors"
              title="Deactivate"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [openEditModal],
  );

  const toolbar = (
    <button
      type="button"
      onClick={openCreateModal}
      className="rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white hover:bg-crust-deep transition-colors"
    >
      + Create Permission
    </button>
  );

  return (
    <section className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-crust-deep">Permissions</h1>
        <p className="mt-1 text-sm text-crust/70">Manage system access permissions.</p>
      </div>

      <DataTable
        data={permissions}
        columns={columns}
        searchPlaceholder="Search permissions..."
        pageSize={PAGE_SIZE}
        toolbar={toolbar}
        emptyMessage={loading ? "Loading…" : "No permissions found."}
        manualPagination
        pageCount={totalPages}
        pageIndex={page - 1}
        onPageChange={(idx) => fetchPermissions(idx + 1)}
        totalRows={total}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Permission" : "Create Permission"}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              placeholder="e.g. view.permissions"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                formErrors.key
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            {formErrors.key && (
              <p className="mt-1 text-xs text-red-500">{formErrors.key}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. View Permissions"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
                formErrors.name
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description…"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-crust px-5 py-2 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60 transition-colors"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {modalMode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate Permission"
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to deactivate{" "}
          <span className="font-semibold text-crust-deep">{deleteTarget?.name}</span>?
          The permission will be marked as <strong>Inactive</strong> and will no longer
          be assignable to roles.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Deactivate
          </button>
        </div>
      </Modal>
    </section>
  );
}

