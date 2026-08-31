"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { RoleSelector, type RoleSelectorRole } from "@/components/ui/RoleSelector";
import { apiUrl, withPermission } from "@/lib/api";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  active: boolean;
  roleIds: number[];
  createdAt: string;
};

type PaginatedUsers = {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type UserFormErrors = Partial<UserForm>;

const emptyForm: UserForm = { firstName: "", lastName: "", email: "", password: "" };
const PAGE_SIZE = 20;

const PASSWORD_RE = {
  letter: /[a-zA-Z]/,
  digit: /\d/,
  special: /[^a-zA-Z\d]/,
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [allRoles, setAllRoles] = useState<RoleSelectorRole[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { toast, showToast, dismiss } = useToast();

  const fullName = useMemo(
    () => `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    [form.firstName, form.lastName],
  );

  const fetchUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/users?page=${p}&pageSize=${PAGE_SIZE}`),
        withPermission("view.users", { credentials: "include" }),
      );
      if (res.ok) {
        const json: PaginatedUsers = await res.json();
        setUsers(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        setPage(json.page);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    const res = await fetch(
      apiUrl("/api/roles"),
      withPermission("view.roles", { credentials: "include" }),
    );
    if (res.ok) {
      const data: RoleSelectorRole[] = await res.json();
      setAllRoles(data);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const validateCreate = (): boolean => {
    const errors: UserFormErrors = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email address";
    }
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 8) {
      errors.password = "Must be at least 8 characters";
    } else if (!PASSWORD_RE.letter.test(form.password)) {
      errors.password = "Must contain at least one letter";
    } else if (!PASSWORD_RE.digit.test(form.password)) {
      errors.password = "Must contain at least one number";
    } else if (!PASSWORD_RE.special.test(form.password)) {
      errors.password = "Must contain at least one special character";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateUpdate = (): boolean => {
    const errors: UserFormErrors = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required";
    if (!form.lastName.trim()) errors.lastName = "Last name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreateModal = useCallback(() => {
    setForm(emptyForm);
    setFormErrors({});
    setSelectedRoleIds([]);
    setShowPassword(false);
    setSelectedUser(null);
    setModalMode("create");
  }, []);

  const openEditModal = useCallback((user: User) => {
    setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: "" });
    setFormErrors({});
    setSelectedRoleIds(user.roleIds);
    setSelectedUser(user);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedUser(null);
    setForm(emptyForm);
    setFormErrors({});
    setSelectedRoleIds([]);
    setShowPassword(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = modalMode === "edit" ? validateUpdate() : validateCreate();
    if (!valid) return;
    setSubmitting(true);
    try {
      const isEdit = modalMode === "edit";
      const url = isEdit ? apiUrl(`/api/users/${selectedUser!.id}`) : apiUrl("/api/users");
      const body = isEdit
        ? { firstName: form.firstName.trim(), lastName: form.lastName.trim(), ...(form.email.trim() ? { email: form.email.trim() } : {}), roleIds: selectedRoleIds }
        : { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, roleIds: selectedRoleIds };
      const res = await fetch(
        url,
        withPermission("manage.users", {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }),
      );
      if (res.ok) {
        showToast(isEdit ? "User updated successfully." : "User created successfully.", "success");
        closeModal();
        fetchUsers(page);
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
        apiUrl(`/api/users/${deleteTarget.id}`),
        withPermission("manage.users", { method: "DELETE", credentials: "include" }),
      );
      if (res.ok) {
        showToast("User deactivated successfully.", "success");
        setDeleteTarget(null);
        fetchUsers(page);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to deactivate user.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "firstName", header: "First Name" },
      { accessorKey: "lastName", header: "Last Name" },
      { accessorKey: "fullName", header: "Full Name" },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-gray-600">{row.original.email}</span>,
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {row.original.active ? "Active" : "Inactive"}
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
      + Create User
    </button>
  );

  const userInfoFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="John"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
              formErrors.firstName ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          {formErrors.firstName && <p className="mt-1 text-xs text-red-500">{formErrors.firstName}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="Doe"
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
              formErrors.lastName ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
          {formErrors.lastName && <p className="mt-1 text-xs text-red-500">{formErrors.lastName}</p>}
        </div>
      </div>

      {fullName && (
        <p className="text-xs text-gray-500">
          Full name: <span className="font-medium text-gray-700">{fullName}</span>
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email {modalMode === "create" && <span className="text-red-500">*</span>}
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="john.doe@example.com"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
            formErrors.email ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          }`}
        />
        {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
      </div>

      {modalMode === "create" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 ${
                formErrors.password ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formErrors.password ? (
            <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">
              Min. 8 characters with a letter, a number, and a special character.
            </p>
          )}
        </div>
      )}
    </>
  );

  return (
    <section className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
      <Toast toast={toast} onDismiss={dismiss} />

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-crust-deep">Users</h1>
        <p className="mt-1 text-sm text-crust/70">Manage system users and their roles.</p>
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Search users..."
        pageSize={PAGE_SIZE}
        toolbar={toolbar}
        emptyMessage={loading ? "Loading…" : "No users found."}
        manualPagination
        pageCount={totalPages}
        pageIndex={page - 1}
        onPageChange={(idx) => fetchUsers(idx + 1)}
        totalRows={total}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit User" : "Create User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {userInfoFields}

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Roles</p>
            <RoleSelector
              roles={allRoles}
              selectedIds={selectedRoleIds}
              onChange={setSelectedRoleIds}
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
        title="Deactivate User"
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to deactivate{" "}
          <span className="font-semibold text-crust-deep">{deleteTarget?.fullName}</span>?
          The user will be marked as <strong>Inactive</strong> and will no longer be able to log in.
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

