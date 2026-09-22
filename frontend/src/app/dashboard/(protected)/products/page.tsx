"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type CategoryOption = { id: number; name: string; description: string | null };

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_special: boolean;
  category_id: number;
  category: CategoryOption;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type PaginatedProducts = {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type ProductForm = {
  name: string;
  description: string;
  price: string;
  image: string;
  category_id: string;
  is_special: boolean;
  is_active: boolean;
};

type FormErrors = Partial<Record<keyof ProductForm, string>>;

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  category_id: "",
  is_special: false,
  is_active: true,
};

const PAGE_SIZE = 20;

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, dismiss } = useToast();

  const fetchCategories = useCallback(async () => {
    const res = await fetch(apiUrl("/api/product-categories"), { credentials: "include" });
    if (res.ok) setCategories(await res.json());
  }, []);

  const fetchProducts = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          apiUrl(`/api/products/admin?page=${p}&pageSize=${PAGE_SIZE}`),
          withPermission("view.product", { credentials: "include" }),
        );
        if (res.ok) {
          const json: PaginatedProducts = await res.json();
          setProducts(json.data);
          setTotal(json.total);
          setTotalPages(json.totalPages);
          setPage(json.page);
        } else {
          const data = await res.json().catch(() => ({}));
          showToast((data as { error?: string }).error ?? "Failed to load products.", "error");
        }
      } finally {
        setLoading(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    void fetchCategories();
    void fetchProducts(1);
  }, [fetchCategories, fetchProducts]);

  const validate = () => {
    const errors: FormErrors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.price.trim() || Number.isNaN(Number(form.price)) || Number(form.price) <= 0) {
      errors.price = "Enter a valid price";
    }
    if (!form.image.trim()) errors.image = "Image URL is required";
    else if (!isValidUrl(form.image.trim())) errors.image = "Enter a valid http(s) URL";
    if (!form.category_id) errors.category_id = "Category is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreate = () => {
    setForm({
      ...emptyForm,
      category_id: categories[0] ? String(categories[0].id) : "",
    });
    setFormErrors({});
    setSelected(null);
    setModalMode("create");
  };

  const openEdit = useCallback((product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      image: product.image,
      category_id: String(product.category_id),
      is_special: product.is_special,
      is_active: product.is_active,
    });
    setFormErrors({});
    setSelected(product);
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
    if (!validate()) return;
    setSubmitting(true);
    try {
      const isEdit = modalMode === "edit";
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: form.image.trim(),
        category_id: Number(form.category_id),
        is_special: form.is_special,
        is_active: form.is_active,
      };
      const res = await fetch(
        isEdit ? apiUrl(`/api/products/${selected!.id}`) : apiUrl("/api/products"),
        withPermission(isEdit ? "update.product" : "create.product", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }),
      );
      if (res.ok) {
        showToast(isEdit ? "Product updated." : "Product created.", "success");
        closeModal();
        void fetchProducts(page);
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
        apiUrl(`/api/products/${deleteTarget.id}`),
        withPermission("delete.product", { method: "DELETE", credentials: "include" }),
      );
      if (res.ok || res.status === 204) {
        showToast("Product deactivated.", "success");
        setDeleteTarget(null);
        void fetchProducts(page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to deactivate.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (key: keyof ProductForm) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
      formErrors[key]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
    }`;

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "thumb",
        header: "Image",
        enableSorting: false,
        cell: ({ row }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.original.image} alt="" className="h-12 w-16 rounded-md object-cover bg-gray-100" />
        ),
      },
      { accessorKey: "name", header: "Name" },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => row.original.category?.name ?? "—",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => `£${Number(row.original.price).toFixed(2)}`,
      },
      {
        accessorKey: "is_special",
        header: "Special",
        cell: ({ row }) => (row.original.is_special ? "Yes" : "No"),
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
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(row.original)}
              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
              title="Deactivate"
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
        <h1 className="font-display text-2xl font-bold text-crust-deep">Products</h1>
        <p className="mt-1 text-sm text-crust/70">Manage bakery products shown on the homepage.</p>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder="Search products..."
        pageSize={PAGE_SIZE}
        toolbar={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white hover:bg-crust-deep"
          >
            + Create Product
          </button>
        }
        emptyMessage={loading ? "Loading…" : "No products found."}
        manualPagination
        pageCount={totalPages}
        pageIndex={page - 1}
        onPageChange={(idx) => void fetchProducts(idx + 1)}
        totalRows={total}
      />

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Product" : "Create Product"}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              className={fieldClass("name")}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              className={fieldClass("description")}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            {formErrors.description && (
              <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Price (£)</label>
              <input
                className={fieldClass("price")}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
              {formErrors.price && <p className="mt-1 text-xs text-red-600">{formErrors.price}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
              <select
                className={fieldClass("category_id")}
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {formErrors.category_id && (
                <p className="mt-1 text-xs text-red-600">{formErrors.category_id}</p>
              )}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Image URL</label>
            <input
              className={fieldClass("image")}
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            />
            {formErrors.image && <p className="mt-1 text-xs text-red-600">{formErrors.image}</p>}
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_special}
                onChange={(e) => setForm((f) => ({ ...f, is_special: e.target.checked }))}
              />
              Featured / special
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
            >
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

      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Deactivate product">
        <p className="text-sm text-gray-600">
          Soft-delete <strong>{deleteTarget?.name}</strong>? It will be hidden from the public site.
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
