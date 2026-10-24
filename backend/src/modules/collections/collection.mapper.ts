import type { CollectionTaskWithDetails } from "./collection.repository.js";

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function toCollectionTaskDto(row: CollectionTaskWithDetails) {
  const amountDue = Math.max(0, Number(row.invoice.subtotal) - Number(row.invoice.amountPaid));
  return {
    id: row.id,
    business_account_id: row.businessAccountId,
    invoice_id: row.invoiceId,
    kind: row.kind,
    status: row.status,
    days_overdue: row.daysOverdue,
    notes: row.notes,
    created_at: row.createdAt.toISOString(),
    resolved_at: row.resolvedAt?.toISOString() ?? null,
    resolved_by_user_id: row.resolvedByUserId,
    business_account: {
      id: row.businessAccount.id,
      business_name: row.businessAccount.businessName,
      credit_tier: row.businessAccount.creditTier,
      late_strike_count: row.businessAccount.lateStrikeCount,
      overdue_paused: row.businessAccount.overduePaused,
      contact_user: row.businessAccount.contactUser
        ? {
            id: row.businessAccount.contactUser.id,
            email: row.businessAccount.contactUser.email,
            full_name: row.businessAccount.contactUser.fullName,
          }
        : null,
    },
    invoice: {
      id: row.invoice.id,
      invoice_number: row.invoice.invoiceNumber,
      due_date: ymd(row.invoice.dueDate),
      status: row.invoice.status,
      amount_due: amountDue,
    },
  };
}
