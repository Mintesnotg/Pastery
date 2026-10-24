import type { InvoiceWithDetails } from "./invoice.repository.js";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function todayYmdLondon() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function displayStatus(row: {
  status: string;
  dueDate: Date;
}): "open" | "paid" | "void" | "overdue" {
  if (row.status === "paid" || row.status === "void") return row.status;
  if (row.status === "open" && ymd(row.dueDate) < todayYmdLondon()) return "overdue";
  return "open";
}

export function toInvoiceDto(row: InvoiceWithDetails) {
  return {
    id: row.id,
    business_account_id: row.businessAccountId,
    invoice_number: row.invoiceNumber,
    period_start: ymd(row.periodStart),
    period_end: ymd(row.periodEnd),
    invoice_date: ymd(row.invoiceDate),
    due_date: ymd(row.dueDate),
    subtotal: Number(row.subtotal),
    amount_paid: Number(row.amountPaid),
    amount_due: Math.max(0, Number(row.subtotal) - Number(row.amountPaid)),
    currency: row.currency,
    status: row.status,
    display_status: displayStatus(row),
    created_by_user_id: row.createdByUserId,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
    business_account: {
      id: row.businessAccount.id,
      business_name: row.businessAccount.businessName,
      credit_tier: row.businessAccount.creditTier,
      contact_user: row.businessAccount.contactUser
        ? {
            id: row.businessAccount.contactUser.id,
            email: row.businessAccount.contactUser.email,
            full_name: row.businessAccount.contactUser.fullName,
          }
        : null,
    },
    lines: row.lines.map((line) => ({
      id: line.id,
      order_id: line.orderId,
      description: line.description,
      amount: Number(line.amount),
      fulfillment_date: line.fulfillmentDate,
    })),
    payments: row.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      paid_at: p.paidAt.toISOString(),
      reference: p.reference,
      method: p.method,
      recorded_by_user_id: p.recordedByUserId,
    })),
  };
}
