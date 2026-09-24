"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
};

type FormErrors = Partial<Record<keyof ProfileForm, string>>;

export default function ProfilePage() {
  const { toast, showToast, dismiss } = useToast();
  const [form, setForm] = useState<ProfileForm>({ firstName: "", lastName: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/auth/me"), { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        if (cancelled) return;
        const permissions: string[] = data.permissions ?? [];
        setCanEdit(permissions.includes("edit.profile"));
        setForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? data.user?.email ?? "",
        });
      } catch (err) {
        if (!cancelled) setLoadError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const validate = () => {
    const next: FormErrors = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !validate()) return;
    setSaving(true);
    try {
      const res = await fetch(
        apiUrl("/api/auth/me"),
        withPermission("edit.profile", {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
          }),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Failed to update profile");
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" aria-label="Loading profile" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Toast toast={toast} onDismiss={dismiss} />
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update your name and email. Password cannot be changed here.</p>
      </div>

      {loadError ? <p className="mb-4 text-sm font-medium text-red-600">{loadError}</p> : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
            First name
          </label>
          <input
            id="firstName"
            value={form.firstName}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
          />
          {errors.firstName ? <p className="mt-1 text-xs text-red-600">{errors.firstName}</p> : null}
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
            Last name
          </label>
          <input
            id="lastName"
            value={form.lastName}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
          />
          {errors.lastName ? <p className="mt-1 text-xs text-red-600">{errors.lastName}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
          />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
        </div>
        {canEdit ? (
          <button
            type="submit"
            disabled={saving}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </button>
        ) : (
          <p className="text-sm text-gray-500">You do not have permission to edit this profile.</p>
        )}
      </form>
    </div>
  );
}
