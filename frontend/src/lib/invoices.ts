import { apiUrl, withPermission } from "@/lib/api";

export type InvoiceLine = {
  id: number;
  order_id: number;
  description: string;
  amount: number;
  fulfillment_date: string;
};

export type InvoicePayment = {
  id: number;
  amount: number;
  paid_at: string;
  reference: string | null;
  method: "bank_transfer" | "cash" | "mobile";
  recorded_by_user_id: string;
};

export type Invoice = {
  id: number;
  business_account_id: number;
  invoice_number: string;
  period_start: string;
  period_end: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: "open" | "paid" | "void";
  display_status: "open" | "paid" | "void" | "overdue";
  created_at: string;
  business_account: {
    id: number;
    business_name: string;
    credit_tier: number;
    contact_user: { id: string; email: string; full_name: string } | null;
  };
  lines: InvoiceLine[];
  payments: InvoicePayment[];
};

export type GenerateInvoicesResult = {
  week_start: string;
  period_end: string;
  invoice_date: string;
  created_count: number;
  skipped_count: number;
  created: Invoice[];
  skipped: { business_account_id: number; reason: string }[];
};

export function formatMoney(value: number) {
  return `£${Number(value).toFixed(2)}`;
}

export function mondayOfWeek(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function fetchAdminInvoices(): Promise<Invoice[]> {
  const res = await fetch(
    apiUrl("/api/invoices"),
    withPermission("create.invoice", { credentials: "include" }),
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to load invoices");
  }
  const data = (await res.json()) as Invoice[];
  return Array.isArray(data) ? data : [];
}

export async function fetchMyInvoices(): Promise<Invoice[]> {
  const res = await fetch(
    apiUrl("/api/invoices/me"),
    withPermission("view.invoices", { credentials: "include" }),
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to load invoices");
  }
  const data = (await res.json()) as Invoice[];
  return Array.isArray(data) ? data : [];
}

export async function fetchInvoiceById(
  id: number,
  permission: "create.invoice" | "view.invoices",
): Promise<Invoice> {
  const res = await fetch(
    apiUrl(`/api/invoices/${id}`),
    withPermission(permission, { credentials: "include" }),
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to load invoice");
  }
  return (await res.json()) as Invoice;
}
