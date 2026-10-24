"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, RefreshCw, Wallet } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Toast, useToast } from "@/components/ui/Toast";
import { apiUrl, withPermission } from "@/lib/api";
import {
  fetchCollectionTasks,
  processCollections,
  todayYmd,
  type CollectionTask,
  type ProcessCollectionsResult,
} from "@/lib/collections";
import { formatMoney } from "@/lib/invoices";

export default function CollectionsPage() {
  const { toast, showToast, dismiss } = useToast();
  const [rows, setRows] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [asOf, setAsOf] = useState(todayYmd);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState<ProcessCollectionsResult | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [downgradeTarget, setDowngradeTarget] = useState<CollectionTask | null>(null);
  const [downgrading, setDowngrading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchCollectionTasks("open"));
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRun = async () => {
    setRunning(true);
    setLastResult(null);
    try {
      const result = await processCollections(asOf);
      setLastResult(result);
      showToast(
        `Reminders ${result.reminders_pre_due + result.reminders_due}; tasks ${result.tasks_created}; paused ${result.paused}`,
        "success",
      );
      await load();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setRunning(false);
    }
  };

  const handleResolve = async (task: CollectionTask) => {
    setResolvingId(task.id);
    try {
      const res = await fetch(
        apiUrl(`/api/collections/tasks/${task.id}/resolve`),
        withPermission("manage.collections", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Resolve failed", "error");
        return;
      }
      showToast("Task resolved", "success");
      await load();
    } finally {
      setResolvingId(null);
    }
  };

  const submitDowngrade = async () => {
    if (!downgradeTarget) return;
    setDowngrading(true);
    try {
      const res = await fetch(
        apiUrl("/api/collections/downgrade"),
        withPermission("manage.collections", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_account_id: downgradeTarget.business_account_id,
          }),
        }),
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast((data as { error?: string }).error ?? "Downgrade failed", "error");
        return;
      }
      showToast("Account downgraded to Tier 0 (prepaid)", "success");
      setDowngradeTarget(null);
      await load();
    } finally {
      setDowngrading(false);
    }
  };

  const columns = useMemo<ColumnDef<CollectionTask>[]>(
    () => [
      {
        id: "cafe",
        header: "Cafe",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-crust-deep">
              {row.original.business_account.business_name}
            </div>
            <div className="text-xs text-crust/60">
              {row.original.business_account.contact_user?.email}
            </div>
            <div className="mt-0.5 text-xs text-crust/50">
              Strikes: {row.original.business_account.late_strike_count} · Tier{" "}
              {row.original.business_account.credit_tier}
              {row.original.business_account.overdue_paused ? " · paused" : ""}
            </div>
          </div>
        ),
      },
      {
        id: "invoice",
        header: "Invoice",
        cell: ({ row }) => (
          <div>
            <Link
              href={`/dashboard/invoices/${row.original.invoice_id}`}
              className="font-semibold text-crust-deep hover:underline"
            >
              {row.original.invoice.invoice_number}
            </Link>
            <div className="text-xs text-crust/60">
              Due {row.original.invoice.due_date} ·{" "}
              {formatMoney(row.original.invoice.amount_due)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "days_overdue",
        header: "Days overdue",
      },
      {
        id: "created",
        header: "Opened",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString("en-GB"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const task = row.original;
          const canDowngrade = task.business_account.late_strike_count >= 2;
          return (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={resolvingId === task.id}
                onClick={() => void handleResolve(task)}
                className="rounded-lg border border-crust/20 px-2.5 py-1 text-xs font-semibold text-crust disabled:opacity-60"
              >
                Resolve
              </button>
              {canDowngrade && task.business_account.credit_tier > 0 ? (
                <button
                  type="button"
                  onClick={() => setDowngradeTarget(task)}
                  className="rounded-lg bg-rose-700 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  Downgrade Tier 0
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [resolvingId],
  );

  return (
    <section className="space-y-6">
      <Toast toast={toast} onDismiss={dismiss} />

      <Modal
        isOpen={downgradeTarget != null}
        onClose={() => (!downgrading ? setDowngradeTarget(null) : undefined)}
        title="Downgrade to Tier 0"
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={downgrading}
              onClick={() => setDowngradeTarget(null)}
              className="rounded-lg border border-crust/20 px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={downgrading}
              onClick={() => void submitDowngrade()}
              className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {downgrading ? "Saving…" : "Confirm downgrade"}
            </button>
          </div>
        }
      >
        {downgradeTarget ? (
          <p className="text-sm text-crust/80">
            Set <strong>{downgradeTarget.business_account.business_name}</strong> to
            prepaid Tier 0? They have{" "}
            {downgradeTarget.business_account.late_strike_count} late strikes.
          </p>
        ) : null}
      </Modal>

      <div className="rounded-2xl border border-crust/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-peach/60 p-2 text-crust">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-crust-deep">Collections</h1>
              <p className="mt-1 text-sm text-crust/70">
                Run reminder emails, pause overdue accounts, and resolve collection tasks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-crust/20 px-3 py-2 text-sm font-medium text-crust hover:bg-cream disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">As of date</label>
            <input
              type="date"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
            />
          </div>
          <button
            type="button"
            disabled={running}
            onClick={() => void handleRun()}
            className="inline-flex items-center gap-2 rounded-lg bg-crust px-4 py-2 text-sm font-semibold text-white hover:bg-crust-deep disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Run collections
          </button>
        </div>

        {lastResult ? (
          <p className="mt-3 text-sm text-crust/70">
            As of {lastResult.as_of}: pre-due {lastResult.reminders_pre_due}, due-day{" "}
            {lastResult.reminders_due}, tasks created {lastResult.tasks_created}, paused{" "}
            {lastResult.paused}, skipped {lastResult.skipped_count}.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-crust/10 bg-white p-4 shadow-sm">
        <h2 className="mb-3 px-1 text-sm font-semibold text-crust-deep">Open collection tasks</h2>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-crust" />
          </div>
        ) : (
          <DataTable columns={columns} data={rows} emptyMessage="No open collection tasks." />
        )}
      </div>
    </section>
  );
}
