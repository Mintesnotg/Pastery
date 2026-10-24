"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Building2, FileUp, Loader2, Upload } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl } from "@/lib/api";

function FileUploadField({
  label,
  required,
  file,
  error,
  onChange,
}: {
  label: string;
  required?: boolean;
  file: File | null;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  const inputId = useId();
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <label
        htmlFor={inputId}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-center transition hover:bg-peach/20 ${
          error
            ? "border-red-400 bg-red-50/40"
            : file
              ? "border-crust/40 bg-cream/60"
              : "border-crust/25 bg-cream/40"
        }`}
      >
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            file ? "bg-crust text-white" : "bg-peach/70 text-crust"
          }`}
        >
          {file ? <FileUp className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
        </span>
        {file ? (
          <>
            <span className="max-w-full truncate text-sm font-semibold text-crust-deep">
              {file.name}
            </span>
            <span className="text-xs text-crust/60">Click to replace · PDF or image · max 5 MB</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-crust-deep">Choose a file</span>
            <span className="text-xs text-crust/60">PDF or image · max 5 MB</span>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

type BusinessAccount = {
  id: number;
  business_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postcode: string;
  country: string;
  phone: string | null;
  approval_status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  credit_tier: number;
  credit_limit: number;
  credit_balance: number;
  overdue_paused: boolean;
  has_business_id_doc: boolean;
  has_license_doc: boolean;
  created_at: string;
};

type FormState = {
  business_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  notes: string;
  business_id_doc: File | null;
  license_doc: File | null;
};

const emptyForm: FormState = {
  business_name: "",
  address_line1: "",
  address_line2: "",
  city: "",
  postcode: "",
  country: "GB",
  phone: "",
  notes: "",
  business_id_doc: null,
  license_doc: null,
};

const tierLabel: Record<number, string> = {
  0: "Tier 0 — Prepaid",
  1: "Tier 1 — Net 7",
  2: "Tier 2 — Net 14",
};

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
}

export default function BusinessAccountPage() {
  const { toast, showToast, dismiss } = useToast();
  const [account, setAccount] = useState<BusinessAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/business-accounts/me"), { credentials: "include" });
      if (res.status === 404) {
        setAccount(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast((data as { error?: string }).error ?? "Failed to load account", "error");
        return;
      }
      setAccount(await res.json());
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const validate = () => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.business_name.trim()) errors.business_name = "Business name is required";
    if (!form.address_line1.trim()) errors.address_line1 = "Address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.postcode.trim()) errors.postcode = "Postcode is required";
    if (!form.business_id_doc) errors.business_id_doc = "Business ID / TIN document is required";
    if (!form.license_doc) errors.license_doc = "License document is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("business_name", form.business_name.trim());
      body.append("address_line1", form.address_line1.trim());
      if (form.address_line2.trim()) body.append("address_line2", form.address_line2.trim());
      body.append("city", form.city.trim());
      body.append("postcode", form.postcode.trim());
      body.append("country", form.country.trim() || "GB");
      if (form.phone.trim()) body.append("phone", form.phone.trim());
      if (form.notes.trim()) body.append("notes", form.notes.trim());
      body.append("business_id_doc", form.business_id_doc!);
      body.append("license_doc", form.license_doc!);

      const res = await fetch(apiUrl("/api/business-accounts"), {
        method: "POST",
        credentials: "include",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Application failed", "error");
        return;
      }
      setAccount(data as BusinessAccount);
      showToast("Application submitted — pending admin review.", "success");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (key: keyof FormState) =>
    `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${
      formErrors[key]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-crust focus:ring-crust/20"
    }`;

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
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-crust-deep">Business account</h1>
          <p className="mt-1 text-sm text-crust/70">
            Apply for cafe / wholesale credit terms. New accounts start on Tier 0 (prepaid).
          </p>
        </div>
      </div>

      {account ? (
        <div className="space-y-4 rounded-xl border border-crust/10 bg-cream/40 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-crust-deep">{account.business_name}</h2>
            {statusBadge(account.approval_status)}
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-crust/60">Address</dt>
              <dd className="text-crust-deep">
                {account.address_line1}
                {account.address_line2 ? `, ${account.address_line2}` : ""}
                <br />
                {account.city}, {account.postcode}, {account.country}
              </dd>
            </div>
            <div>
              <dt className="text-crust/60">Phone</dt>
              <dd className="text-crust-deep">{account.phone || "—"}</dd>
            </div>
            {account.approval_status === "approved" && (
              <>
                <div>
                  <dt className="text-crust/60">Credit tier</dt>
                  <dd className="text-crust-deep">{tierLabel[account.credit_tier] ?? account.credit_tier}</dd>
                </div>
                <div>
                  <dt className="text-crust/60">Credit limit / balance</dt>
                  <dd className="text-crust-deep">
                    £{account.credit_limit.toFixed(2)} / £{account.credit_balance.toFixed(2)}
                    {account.overdue_paused ? " (paused)" : ""}
                  </dd>
                </div>
              </>
            )}
          </dl>
          {account.approval_status === "pending" && (
            <p className="text-sm text-amber-800">
              Your application is under review. You cannot place wholesale credit orders until approved.
            </p>
          )}
          {account.approval_status === "rejected" && (
            <p className="text-sm text-red-700">
              Rejected{account.rejection_reason ? `: ${account.rejection_reason}` : "."}
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4" noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Business name <span className="text-red-500">*</span>
            </label>
            <input
              className={fieldClass("business_name")}
              value={form.business_name}
              onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
            />
            {formErrors.business_name && (
              <p className="mt-1 text-xs text-red-500">{formErrors.business_name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Address line 1 <span className="text-red-500">*</span>
            </label>
            <input
              className={fieldClass("address_line1")}
              value={form.address_line1}
              onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))}
            />
            {formErrors.address_line1 && (
              <p className="mt-1 text-xs text-red-500">{formErrors.address_line1}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address line 2</label>
            <input
              className={fieldClass("address_line2")}
              value={form.address_line2}
              onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                className={fieldClass("city")}
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
              {formErrors.city && <p className="mt-1 text-xs text-red-500">{formErrors.city}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Postcode <span className="text-red-500">*</span>
              </label>
              <input
                className={fieldClass("postcode")}
                value={form.postcode}
                onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
              />
              {formErrors.postcode && (
                <p className="mt-1 text-xs text-red-500">{formErrors.postcode}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
              <input
                className={fieldClass("country")}
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input
              className={fieldClass("phone")}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>

          <FileUploadField
            label="Business ID / TIN document"
            required
            file={form.business_id_doc}
            error={formErrors.business_id_doc}
            onChange={(file) => setForm((f) => ({ ...f, business_id_doc: file }))}
          />

          <FileUploadField
            label="License document"
            required
            file={form.license_doc}
            error={formErrors.license_doc}
            onChange={(file) => setForm((f) => ({ ...f, license_doc: file }))}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={3}
              className={fieldClass("notes")}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-crust px-5 py-2.5 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit application
          </button>
        </form>
      )}
    </section>
  );
}
