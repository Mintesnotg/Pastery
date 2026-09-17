"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type Banner = {
  id: string;
  title: string;
  alt_text: string;
  image_url: string;
  cta: { label: string; link: string };
  overlay_text: { heading: string; subheading: string };
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type PaginatedBanners = {
  data: Banner[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type BannerForm = {
  title: string;
  alt_text: string;
  image_url: string;
  cta_label: string;
  cta_link: string;
  overlay_heading: string;
  overlay_subheading: string;
  is_active: boolean;
  sort_order: string;
};

type BannerFormErrors = Partial<Record<keyof BannerForm, string>>;

const emptyForm: BannerForm = {
  title: "",
  alt_text: "",
  image_url: "",
  cta_label: "",
  cta_link: "",
  overlay_heading: "",
  overlay_subheading: "",
  is_active: true,
  sort_order: "0",
};

const PAGE_SIZE = 20;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<BannerFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, dismiss } = useToast();

  const fetchBanners = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/banners/admin?page=${p}&pageSize=${PAGE_SIZE}`),
        withPermission("view.banner", { credentials: "include" }),
      );
      if (res.ok) {
        const json: PaginatedBanners = await res.json();
        setBanners(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        setPage(json.page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to load banners.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBanners(1);
  }, [fetchBanners]);

  const validate = (): boolean => {
    const errors: BannerFormErrors = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.alt_text.trim()) errors.alt_text = "Alt text is required";
    if (!form.image_url.trim()) errors.image_url = "Image URL is required";
    else if (!isValidUrl(form.image_url.trim())) errors.image_url = "Enter a valid http(s) URL";
    if (!form.cta_label.trim()) errors.cta_label = "CTA label is required";
    if (!form.cta_link.trim()) errors.cta_link = "CTA link is required";
    if (!form.overlay_heading.trim()) errors.overlay_heading = "Overlay heading is required";
    if (!form.overlay_subheading.trim()) errors.overlay_subheading = "Overlay subheading is required";
    if (form.sort_order.trim() === "" || Number.isNaN(Number(form.sort_order)) || !Number.isInteger(Number(form.sort_order))) {
      errors.sort_order = "Sort order must be an integer";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = useCallback(() => {
    setForm(emptyForm);
    setFormErrors({});
    setSelectedBanner(null);
    setModalMode("create");
  }, []);

  const openEditModal = useCallback((banner: Banner) => {
    setForm({
      title: banner.title,
      alt_text: banner.alt_text,
      image_url: banner.image_url,
      cta_label: banner.cta.label,
      cta_link: banner.cta.link,
      overlay_heading: banner.overlay_text.heading,
      overlay_subheading: banner.overlay_text.subheading,
      is_active: banner.is_active,
      sort_order: String(banner.sort_order),
    });
    setFormErrors({});
    setSelectedBanner(banner);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedBanner(null);
    setForm(emptyForm);
    setFormErrors({});
  }, []);

  const buildPayload = () => ({
    title: form.title.trim(),
    alt_text: form.alt_text.trim(),
    image_url: form.image_url.trim(),
    cta: { label: form.cta_label.trim(), link: form.cta_link.trim() },
    overlay_text: {
      heading: form.overlay_heading.trim(),
      subheading: form.overlay_subheading.trim(),
    },
    is_active: form.is_active,
    sort_order: Number(form.sort_order),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const isEdit = modalMode === "edit";
      const permission = isEdit ? "update.banner" : "create.banner";
      const url = isEdit ? apiUrl(`/api/banners/${selectedBanner!.id}`) : apiUrl("/api/banners");
      const res = await fetch(
        url,
        withPermission(permission, {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(buildPayload()),
        }),
      );
      if (res.ok) {
        showToast(isEdit ? "Banner updated successfully." : "Banner created successfully.", "success");
        closeModal();
        fetchBanners(page);
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
        apiUrl(`/api/banners/${deleteTarget.id}`),
        withPermission("delete.banner", { method: "DELETE", credentials: "include" }),
      );
      if (res.ok || res.status === 204) {
        showToast("Banner deactivated successfully.", "success");
        setDeleteTarget(null);
        fetchBanners(page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to deactivate banner.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (key: keyof BannerForm) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
      formErrors[key]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
    }`;

  const columns = useMemo<ColumnDef<Banner>[]>(
    () => [
      {
        id: "thumbnail",
        header: "Image",
        enableSorting: false,
        cell: ({ row }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.original.image_url}
            alt={row.original.alt_text}
            className="h-12 w-20 rounded-md object-cover bg-gray-100"
          />
        ),
      },
      { accessorKey: "title", header: "Title" },
      {
        id: "cta",
        header: "CTA",
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.cta.label}</span>
        ),
      },
      {
        accessorKey: "sort_order",
        header: "Sort",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.sort_order}</span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "Updated",
        cell: ({ row }) =>
          new Date(row.original.updated_at).toLocaleDateString("en-GB", {
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
              disabled={!row.original.is_active}
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
      + Create Banner
    </button>
  );

  return (
    <section className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-crust-deep">Banners</h1>
        <p className="mt-1 text-sm text-crust/70">Manage homepage carousel banners.</p>
      </div>

      <DataTable
        data={banners}
        columns={columns}
        searchPlaceholder="Search banners..."
        pageSize={PAGE_SIZE}
        toolbar={toolbar}
        emptyMessage={loading ? "Loading…" : "No banners found."}
        manualPagination
        pageCount={totalPages}
        pageIndex={page - 1}
        onPageChange={(idx) => fetchBanners(idx + 1)}
        totalRows={total}
      />

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Banner" : "Create Banner"}
      >
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className={fieldClass("title")}
            />
            {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Alt text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.alt_text}
              onChange={(e) => setForm((f) => ({ ...f, alt_text: e.target.value }))}
              className={fieldClass("alt_text")}
            />
            {formErrors.alt_text && <p className="mt-1 text-xs text-red-500">{formErrors.alt_text}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className={fieldClass("image_url")}
            />
            {formErrors.image_url && <p className="mt-1 text-xs text-red-500">{formErrors.image_url}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                CTA label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.cta_label}
                onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))}
                className={fieldClass("cta_label")}
              />
              {formErrors.cta_label && <p className="mt-1 text-xs text-red-500">{formErrors.cta_label}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                CTA link <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.cta_link}
                onChange={(e) => setForm((f) => ({ ...f, cta_link: e.target.value }))}
                placeholder="/order"
                className={fieldClass("cta_link")}
              />
              {formErrors.cta_link && <p className="mt-1 text-xs text-red-500">{formErrors.cta_link}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Overlay heading <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.overlay_heading}
              onChange={(e) => setForm((f) => ({ ...f, overlay_heading: e.target.value }))}
              className={fieldClass("overlay_heading")}
            />
            {formErrors.overlay_heading && (
              <p className="mt-1 text-xs text-red-500">{formErrors.overlay_heading}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Overlay subheading <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.overlay_subheading}
              onChange={(e) => setForm((f) => ({ ...f, overlay_subheading: e.target.value }))}
              rows={2}
              className={`resize-none ${fieldClass("overlay_subheading")}`}
            />
            {formErrors.overlay_subheading && (
              <p className="mt-1 text-xs text-red-500">{formErrors.overlay_subheading}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sort order</label>
              <input
                type="number"
                step={1}
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                className={fieldClass("sort_order")}
              />
              {formErrors.sort_order && (
                <p className="mt-1 text-xs text-red-500">{formErrors.sort_order}</p>
              )}
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 accent-crust"
                />
                Active
              </label>
            </div>
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

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Deactivate Banner"
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to deactivate{" "}
          <span className="font-semibold text-crust-deep">{deleteTarget?.title}</span>? The banner
          will be marked as <strong>Inactive</strong> and hidden from the public homepage carousel.
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
