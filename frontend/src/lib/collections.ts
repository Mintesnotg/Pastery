import { apiUrl, withPermission } from "@/lib/api";

export type CollectionTask = {
  id: number;
  business_account_id: number;
  invoice_id: number;
  kind: string;
  status: "open" | "resolved" | "cancelled";
  days_overdue: number;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
  business_account: {
    id: number;
    business_name: string;
    credit_tier: number;
    late_strike_count: number;
    overdue_paused: boolean;
    contact_user: { id: string; email: string; full_name: string } | null;
  };
  invoice: {
    id: number;
    invoice_number: string;
    due_date: string;
    status: string;
    amount_due: number;
  };
};

export type ProcessCollectionsResult = {
  as_of: string;
  reminders_pre_due: number;
  reminders_due: number;
  paused: number;
  tasks_created: number;
  skipped_count: number;
  skipped: { invoice_id: number; reason: string }[];
};

export function todayYmd() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function fetchCollectionTasks(status = "open"): Promise<CollectionTask[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(
    apiUrl(`/api/collections/tasks${qs}`),
    withPermission("manage.collections", { credentials: "include" }),
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to load collection tasks");
  }
  const data = (await res.json()) as CollectionTask[];
  return Array.isArray(data) ? data : [];
}

export async function processCollections(date?: string): Promise<ProcessCollectionsResult> {
  const res = await fetch(
    apiUrl("/api/collections/process"),
    withPermission("manage.collections", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: date || undefined }),
    }),
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Process failed");
  }
  return data as ProcessCollectionsResult;
}
