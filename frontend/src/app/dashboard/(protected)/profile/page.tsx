"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Pencil } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";

const BROWN = "#734F32";
const PEACH = "#FDEBDD";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
};

type FormErrors = Partial<Record<keyof ProfileForm, string>>;

function initialsFrom(firstName: string, lastName: string) {
  const a = firstName.trim().charAt(0);
  const b = lastName.trim().charAt(0);
  const value = `${a}${b}`.toUpperCase();
  return value || "?";
}

export default function ProfilePage() {
  const { toast, showToast, dismiss } = useToast();
  const [form, setForm] = useState<ProfileForm>({ firstName: "", lastName: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
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
        setEmailVerified(Boolean(data.emailVerifiedAt));
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

  const initials = useMemo(
    () => initialsFrom(form.firstName, form.lastName),
    [form.firstName, form.lastName],
  );

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
        <Loader2 className="h-8 w-8 animate-spin text-[#734F32]" aria-label="Loading profile" />
      </div>
    );
  }

  const fieldClass = (hasError?: boolean) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#3F2A18] outline-none transition focus:border-[#734F32]/50 disabled:bg-[#FAF6F1] disabled:text-[#9A8573] ${
      hasError ? "border-red-400" : "border-[#E8DDD2]"
    }`;

  return (
    <div className="mx-auto max-w-3xl">
      <Toast toast={toast} onDismiss={dismiss} />

      {loadError ? <p className="mb-4 text-sm font-medium text-red-600">{loadError}</p> : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#E8DDD2] bg-white p-6 shadow-[0_12px_40px_rgba(63,42,24,0.06)] sm:p-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-semibold tracking-wide"
              style={{ backgroundColor: PEACH, color: BROWN }}
              aria-hidden
            >
              {initials}
            </div>
            <span
              className="absolute -right-0.5 -bottom-0.5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm"
              style={{ backgroundColor: BROWN }}
              aria-hidden
            >
              <Pencil size={12} />
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#3F2A18]">Your profile</h1>
            <p className="mt-1 text-sm text-[#6B5648]">
              Update your name and email. Password cannot be changed here.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-[#3F2A18]">
              First name
            </label>
            <input
              id="firstName"
              value={form.firstName}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className={fieldClass(Boolean(errors.firstName))}
              placeholder="Amira"
            />
            {errors.firstName ? <p className="mt-1.5 text-xs text-red-600">{errors.firstName}</p> : null}
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-[#3F2A18]">
              Last name
            </label>
            <input
              id="lastName"
              value={form.lastName}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className={fieldClass(Boolean(errors.lastName))}
              placeholder="Jones"
            />
            {errors.lastName ? <p className="mt-1.5 text-xs text-red-600">{errors.lastName}</p> : null}
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="email" className="text-sm font-semibold text-[#3F2A18]">
              Email address
            </label>
            {emailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={12} />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Unverified
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={form.email}
              disabled={!canEdit}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`${fieldClass(Boolean(errors.email))} ${emailVerified ? "pr-10" : ""}`}
              placeholder="you@example.com"
            />
            {emailVerified ? (
              <CheckCircle2
                size={18}
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-emerald-600"
                aria-hidden
              />
            ) : null}
          </div>
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
          ) : (
            <p className="mt-1.5 text-xs text-[#9A8573]">
              We send order updates and bakery notes here.
            </p>
          )}
        </div>

        {canEdit ? (
          <div className="mt-8">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: BROWN }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
          </div>
        ) : (
          <p className="mt-6 text-sm text-[#6B5648]">You do not have permission to edit this profile.</p>
        )}
      </form>
    </div>
  );
}
