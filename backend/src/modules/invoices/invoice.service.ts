import { afterInvoicePayment } from "../collections/collection.service.js";
import {
  createInvoiceWithLines,
  createPaymentAndUpdateInvoice,
  findBillableOrdersForWeek,
  findBusinessAccountIdByUserId,
  findExistingInvoiceForPeriod,
  findInvoiceById,
  listInvoices,
  voidInvoiceById,
  type InvoiceWithDetails,
} from "./invoice.repository.js";
import { toInvoiceDto } from "./invoice.mapper.js";

function httpError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDaysYmd(ymd: string, days: number): string {
  const d = parseYmd(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return formatYmd(d);
}

/** Monday of the week containing `ymd` (UTC date parts = calendar date). */
export function mondayOfWeek(ymd: string): string {
  const d = parseYmd(ymd);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const offset = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + offset);
  return formatYmd(d);
}

function todayYmdLondon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isoWeekNumber(ymd: string): { year: number; week: number } {
  const d = parseYmd(ymd);
  // ISO week date algorithm
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: tmp.getUTCFullYear(), week };
}

function netDaysForTier(tier: number): number | null {
  if (tier === 1) return 7;
  if (tier === 2) return 14;
  return null;
}

function mapDto(row: InvoiceWithDetails) {
  return toInvoiceDto(row);
}

export async function generateWeeklyInvoices(input: {
  weekStart?: string;
  businessAccountId?: number;
  createdByUserId: string;
}) {
  const weekStart = mondayOfWeek(input.weekStart ?? todayYmdLondon());
  const periodEnd = addDaysYmd(weekStart, 6);
  const invoiceDate = todayYmdLondon();
  const { year, week } = isoWeekNumber(weekStart);

  const orders = await findBillableOrdersForWeek({
    periodStart: weekStart,
    periodEnd,
    businessAccountId: input.businessAccountId,
  });

  const byAccount = new Map<
    number,
    {
      account: NonNullable<(typeof orders)[number]["businessAccount"]>;
      orders: typeof orders;
    }
  >();

  for (const order of orders) {
    if (!order.businessAccountId || !order.businessAccount) continue;
    const bucket = byAccount.get(order.businessAccountId) ?? {
      account: order.businessAccount,
      orders: [],
    };
    bucket.orders.push(order);
    byAccount.set(order.businessAccountId, bucket);
  }

  const created: ReturnType<typeof toInvoiceDto>[] = [];
  const skipped: { business_account_id: number; reason: string }[] = [];

  for (const [accountId, bucket] of byAccount) {
    const net = netDaysForTier(bucket.account.creditTier);
    if (net == null) {
      skipped.push({
        business_account_id: accountId,
        reason: "Account is prepaid (tier 0); credit invoices not generated",
      });
      continue;
    }

    const existing = await findExistingInvoiceForPeriod(accountId, parseYmd(weekStart));
    if (existing) {
      skipped.push({
        business_account_id: accountId,
        reason: `Invoice already exists for this week (${existing.invoiceNumber})`,
      });
      continue;
    }

    const lines = bucket.orders.map((order) => ({
      orderId: order.id,
      description: `Order #HB-${order.id} (${order.fulfillmentType}) ${order.pickupDate}`,
      amount: Number(order.total),
      fulfillmentDate: order.pickupDate,
    }));
    const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
    if (subtotal <= 0 || lines.length === 0) {
      skipped.push({ business_account_id: accountId, reason: "No billable amount" });
      continue;
    }

    const invoiceNumber = `HOB-${year}-W${String(week).padStart(2, "0")}-${accountId}`;
    const dueDate = addDaysYmd(invoiceDate, net);

    const invoice = await createInvoiceWithLines({
      businessAccountId: accountId,
      invoiceNumber,
      periodStart: parseYmd(weekStart),
      periodEnd: parseYmd(periodEnd),
      invoiceDate: parseYmd(invoiceDate),
      dueDate: parseYmd(dueDate),
      subtotal,
      createdByUserId: input.createdByUserId,
      lines,
    });
    created.push(mapDto(invoice));
  }

  // Accounts with an existing invoice but no new billable orders aren't in byAccount —
  // also report when filter targeted one account with nothing to invoice.
  if (input.businessAccountId != null && !byAccount.has(input.businessAccountId)) {
    const existing = await findExistingInvoiceForPeriod(
      input.businessAccountId,
      parseYmd(weekStart),
    );
    if (existing) {
      skipped.push({
        business_account_id: input.businessAccountId,
        reason: `Invoice already exists for this week (${existing.invoiceNumber})`,
      });
    } else {
      skipped.push({
        business_account_id: input.businessAccountId,
        reason: "No completed credit wholesale orders in this week",
      });
    }
  }

  return {
    week_start: weekStart,
    period_end: periodEnd,
    invoice_date: invoiceDate,
    created_count: created.length,
    skipped_count: skipped.length,
    created,
    skipped,
  };
}

export async function listInvoicesAdmin(filters?: {
  businessAccountId?: number;
  status?: "open" | "paid" | "void";
}) {
  const rows = await listInvoices(filters);
  return rows.map(mapDto);
}

export async function listMyInvoices(userId: string) {
  const accountId = await findBusinessAccountIdByUserId(userId);
  if (accountId == null) return [];
  const rows = await listInvoices({ businessAccountId: accountId });
  return rows.map(mapDto);
}

export async function getInvoiceForUser(
  id: number,
  opts: { userId: string; isAdmin: boolean },
) {
  const row = await findInvoiceById(id);
  if (!row) return null;

  if (!opts.isAdmin) {
    const accountId = await findBusinessAccountIdByUserId(opts.userId);
    if (accountId == null || row.businessAccountId !== accountId) {
      throw httpError(403, "Forbidden");
    }
  }

  return mapDto(row);
}

export async function recordInvoicePayment(
  id: number,
  input: {
    amount: number;
    reference?: string | null;
    method: "bank_transfer" | "cash" | "mobile";
    recordedByUserId: string;
  },
) {
  const row = await findInvoiceById(id);
  if (!row) return null;
  if (row.status !== "open") {
    throw httpError(400, "Only open invoices can accept payments");
  }

  const subtotal = Number(row.subtotal);
  const amountPaid = Number(row.amountPaid);
  const remaining = Math.round((subtotal - amountPaid) * 100) / 100;
  if (input.amount > remaining + 0.001) {
    throw httpError(400, `Payment exceeds amount due (£${remaining.toFixed(2)})`);
  }

  const newAmountPaid = Math.round((amountPaid + input.amount) * 100) / 100;
  const newStatus = newAmountPaid >= subtotal - 0.001 ? "paid" : "open";

  const updated = await createPaymentAndUpdateInvoice({
    invoiceId: id,
    amount: input.amount,
    reference: input.reference,
    method: input.method,
    recordedByUserId: input.recordedByUserId,
    newAmountPaid,
    newStatus,
    businessAccountId: row.businessAccountId,
    creditDecrement: input.amount,
  });

  await afterInvoicePayment({
    invoiceId: id,
    businessAccountId: row.businessAccountId,
    invoiceStatus: newStatus,
  });

  return mapDto(updated);
}

export async function voidInvoice(id: number) {
  const row = await findInvoiceById(id);
  if (!row) return null;
  if (row.status === "void") {
    throw httpError(400, "Invoice is already void");
  }
  if (row.status === "paid" || Number(row.amountPaid) > 0) {
    throw httpError(400, "Cannot void an invoice with payments recorded");
  }
  const updated = await voidInvoiceById(id);
  return mapDto(updated);
}
