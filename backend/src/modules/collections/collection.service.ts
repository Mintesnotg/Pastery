import { sendInvoiceReminderEmail } from "../../shared/lib/mailer.js";
import {
  clearAccountOverduePause,
  countOpenOverdueInvoices,
  createOverduePauseTask,
  downgradeAccountTier0,
  findBusinessAccountById,
  findCollectionTaskById,
  findOpenInvoicesDueOn,
  findOpenInvoicesOverdueBy,
  listCollectionTasks,
  resolveCollectionTaskById,
  resolveOpenTasksForInvoice,
  stampInvoiceReminder,
} from "./collection.repository.js";
import { toCollectionTaskDto } from "./collection.mapper.js";

function httpError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

function todayYmdLondon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(earlierYmd: string, laterYmd: string): number {
  const a = new Date(`${earlierYmd}T00:00:00.000Z`).getTime();
  const b = new Date(`${laterYmd}T00:00:00.000Z`).getTime();
  return Math.floor((b - a) / 86400000);
}

function amountDue(subtotal: unknown, amountPaid: unknown) {
  return Math.max(0, Number(subtotal) - Number(amountPaid));
}

export async function processCollections(asOfDate?: string) {
  const asOf = asOfDate ?? todayYmdLondon();
  const preDueDate = addDaysYmd(asOf, 2);

  let remindersPreDue = 0;
  let remindersDue = 0;
  let paused = 0;
  let tasksCreated = 0;
  const skipped: { invoice_id: number; reason: string }[] = [];
  const details: {
    reminders_pre_due: number[];
    reminders_due: number[];
    tasks_created: number[];
  } = { reminders_pre_due: [], reminders_due: [], tasks_created: [] };

  const preDueInvoices = await findOpenInvoicesDueOn(preDueDate);
  for (const inv of preDueInvoices) {
    if (inv.reminderPreDueSentAt) {
      skipped.push({ invoice_id: inv.id, reason: "Pre-due reminder already sent" });
      continue;
    }
    const email = inv.businessAccount.contactUser?.email;
    if (!email) {
      skipped.push({ invoice_id: inv.id, reason: "No contact email" });
      continue;
    }
    await sendInvoiceReminderEmail({
      to: email,
      contactName: inv.businessAccount.contactUser?.fullName,
      businessName: inv.businessAccount.businessName,
      invoiceNumber: inv.invoiceNumber,
      amountDue: amountDue(inv.subtotal, inv.amountPaid),
      dueDate: preDueDate,
      kind: "pre_due",
    });
    await stampInvoiceReminder(inv.id, "pre_due");
    remindersPreDue += 1;
    details.reminders_pre_due.push(inv.id);
  }

  const dueInvoices = await findOpenInvoicesDueOn(asOf);
  for (const inv of dueInvoices) {
    if (inv.reminderDueSentAt) {
      skipped.push({ invoice_id: inv.id, reason: "Due-day reminder already sent" });
      continue;
    }
    const email = inv.businessAccount.contactUser?.email;
    if (!email) {
      skipped.push({ invoice_id: inv.id, reason: "No contact email" });
      continue;
    }
    await sendInvoiceReminderEmail({
      to: email,
      contactName: inv.businessAccount.contactUser?.fullName,
      businessName: inv.businessAccount.businessName,
      invoiceNumber: inv.invoiceNumber,
      amountDue: amountDue(inv.subtotal, inv.amountPaid),
      dueDate: asOf,
      kind: "due",
    });
    await stampInvoiceReminder(inv.id, "due");
    remindersDue += 1;
    details.reminders_due.push(inv.id);
  }

  const overdueInvoices = await findOpenInvoicesOverdueBy(asOf, 3);
  for (const inv of overdueInvoices) {
    const dueYmd = inv.dueDate.toISOString().slice(0, 10);
    const daysOverdue = daysBetween(dueYmd, asOf);
    const result = await createOverduePauseTask({
      businessAccountId: inv.businessAccountId,
      invoiceId: inv.id,
      daysOverdue,
    });
    if (!inv.businessAccount.overduePaused || result.created) {
      paused += 1;
    }
    if (result.created) {
      tasksCreated += 1;
      details.tasks_created.push(inv.id);
    } else {
      skipped.push({ invoice_id: inv.id, reason: "Collection task already exists" });
    }
  }

  return {
    as_of: asOf,
    reminders_pre_due: remindersPreDue,
    reminders_due: remindersDue,
    paused,
    tasks_created: tasksCreated,
    skipped_count: skipped.length,
    skipped,
    details,
  };
}

export async function listTasks(filters?: {
  status?: "open" | "resolved" | "cancelled";
  businessAccountId?: number;
}) {
  const rows = await listCollectionTasks(filters);
  return rows.map(toCollectionTaskDto);
}

export async function resolveTask(
  id: number,
  resolvedByUserId: string,
  notes?: string | null,
) {
  const existing = await findCollectionTaskById(id);
  if (!existing) return null;
  if (existing.status !== "open") {
    throw httpError(400, "Task is not open");
  }

  const updated = await resolveCollectionTaskById(id, resolvedByUserId, notes);
  await maybeClearOverduePause(existing.businessAccountId);
  return toCollectionTaskDto(updated);
}

export async function maybeClearOverduePause(businessAccountId: number, asOf?: string) {
  const today = asOf ?? todayYmdLondon();
  const overdueCount = await countOpenOverdueInvoices(businessAccountId, today);
  if (overdueCount === 0) {
    await clearAccountOverduePause(businessAccountId);
  }
}

/** Called after invoice payment to resolve tasks and clear pause when safe. */
export async function afterInvoicePayment(input: {
  invoiceId: number;
  businessAccountId: number;
  invoiceStatus: string;
}) {
  if (input.invoiceStatus === "paid") {
    await resolveOpenTasksForInvoice(input.invoiceId);
  }
  await maybeClearOverduePause(input.businessAccountId);
}

export async function downgradeToTier0(input: {
  businessAccountId: number;
  force?: boolean;
  notes?: string | null;
}) {
  const account = await findBusinessAccountById(input.businessAccountId);
  if (!account) return null;

  if (!input.force && account.lateStrikeCount < 2) {
    throw httpError(
      400,
      `Account has ${account.lateStrikeCount} late strike(s); need at least 2 (or pass force)`,
    );
  }

  const updated = await downgradeAccountTier0(input.businessAccountId);
  return {
    id: updated.id,
    business_name: updated.businessName,
    credit_tier: updated.creditTier,
    late_strike_count: updated.lateStrikeCount,
    overdue_paused: updated.overduePaused,
    notes: input.notes?.trim() || null,
    contact_user: updated.contactUser
      ? {
          id: updated.contactUser.id,
          email: updated.contactUser.email,
          full_name: updated.contactUser.fullName,
        }
      : null,
  };
}
