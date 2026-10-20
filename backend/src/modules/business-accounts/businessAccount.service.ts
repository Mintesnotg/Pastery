import type { BusinessApprovalStatus } from "@prisma/client";
import { toBusinessAccountDto } from "./businessAccount.mapper.js";
import type { BusinessAccount } from "@prisma/client";
import {
  assignUserRole,
  countBusinessAccounts,
  countUnpaidPrepaidWholesaleOrders,
  createBusinessAccount,
  findBusinessAccountById,
  findBusinessAccountByUserId,
  findCafeRole,
  findUserRole,
  listBusinessAccounts,
  updateBusinessAccount,
} from "./businessAccount.repository.js";
import { resolveStoredPath } from "./businessAccount.upload.js";

function httpError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

export type RegisterInput = {
  business_name: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  postcode: string;
  country?: string;
  phone?: string | null;
  notes?: string | null;
  businessIdDocPath?: string | null;
  licenseDocPath?: string | null;
};

export type AdminUpdateInput = {
  approval_status?: "pending" | "approved" | "rejected";
  rejection_reason?: string | null;
  credit_tier?: number;
  credit_limit?: number;
  overdue_paused?: boolean;
  notes?: string | null;
};

export async function getMyBusinessAccount(userId: string) {
  const row = await findBusinessAccountByUserId(userId);
  return row ? toBusinessAccountDto(row) : null;
}

export async function getBusinessAccount(id: number) {
  const row = await findBusinessAccountById(id);
  return row ? toBusinessAccountDto(row) : null;
}

export async function listAdminBusinessAccounts(options: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
} = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const status =
    options.status === "pending" || options.status === "approved" || options.status === "rejected"
      ? (options.status as BusinessApprovalStatus)
      : undefined;

  const [rows, total] = await Promise.all([
    listBusinessAccounts({ status, limit: pageSize, offset, search: options.search }),
    countBusinessAccounts({ status, search: options.search }),
  ]);

  return {
    data: rows.map(toBusinessAccountDto),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function registerBusinessAccount(userId: string, input: RegisterInput) {
  const existing = await findBusinessAccountByUserId(userId);
  if (existing) {
    const err = new Error("Business account already exists for this user");
    (err as Error & { status?: number }).status = 409;
    throw err;
  }

  const created = await createBusinessAccount({
    contactUser: { connect: { id: userId } },
    businessName: input.business_name,
    addressLine1: input.address_line1,
    addressLine2: input.address_line2 || null,
    city: input.city,
    postcode: input.postcode,
    country: input.country || "GB",
    phone: input.phone || null,
    notes: input.notes || null,
    businessIdDocPath: input.businessIdDocPath || null,
    licenseDocPath: input.licenseDocPath || null,
    approvalStatus: "pending",
    creditTier: 0,
    creditLimit: 0,
    creditBalance: 0,
  });

  return toBusinessAccountDto(created);
}

export async function adminUpdateBusinessAccount(id: number, input: AdminUpdateInput) {
  const existing = await findBusinessAccountById(id);
  if (!existing) return null;

  const data: Parameters<typeof updateBusinessAccount>[1] = {};

  if (input.notes !== undefined) data.notes = input.notes;
  if (input.overdue_paused !== undefined) data.overduePaused = input.overdue_paused;
  if (input.credit_limit !== undefined) data.creditLimit = input.credit_limit;
  if (input.credit_tier !== undefined) data.creditTier = input.credit_tier;

  if (input.approval_status === "approved") {
    data.approvalStatus = "approved";
    data.rejectionReason = null;
    data.approvedAt = new Date();
    data.creditTier = input.credit_tier ?? existing.creditTier;
    if (input.credit_limit !== undefined) data.creditLimit = input.credit_limit;
  } else if (input.approval_status === "rejected") {
    data.approvalStatus = "rejected";
    data.rejectionReason = input.rejection_reason ?? null;
    data.approvedAt = null;
  } else if (input.approval_status === "pending") {
    data.approvalStatus = "pending";
    data.rejectionReason = null;
    data.approvedAt = null;
  } else if (input.rejection_reason !== undefined) {
    data.rejectionReason = input.rejection_reason;
  }

  const updated = await updateBusinessAccount(id, data);
  if (!updated) return null;

  if (input.approval_status === "approved") {
    const cafeRole = await findCafeRole();
    if (cafeRole) {
      const existingRole = await findUserRole(updated.contactUserId, cafeRole.id);
      if (!existingRole) {
        await assignUserRole(updated.contactUserId, cafeRole.id);
      }
    }
  }

  return toBusinessAccountDto(updated);
}

export type DocumentPathResult =
  | { error: "not_found" | "forbidden" | "missing" }
  | { absolute: string; filename: string };

export async function getDocumentAbsolutePath(
  accountId: number,
  kind: "business-id" | "license",
  requester: { userId: string; isAdminViewer: boolean },
): Promise<DocumentPathResult> {
  const account = await findBusinessAccountById(accountId);
  if (!account) return { error: "not_found" };

  const isOwner = account.contactUserId === requester.userId;
  if (!isOwner && !requester.isAdminViewer) {
    return { error: "forbidden" };
  }

  const stored =
    kind === "license" ? account.licenseDocPath : account.businessIdDocPath;
  if (!stored) return { error: "missing" };

  const absolute = resolveStoredPath(stored);
  if (!absolute) return { error: "missing" };

  return { absolute, filename: stored.split("/").pop() ?? `${kind}.bin` };
}

/** Approved + not overdue-paused. */
export async function assertCanPlaceWholesaleOrder(userId: string) {
  const account = await findBusinessAccountByUserId(userId);
  if (!account || account.approvalStatus !== "approved") {
    throw httpError(403, "Approved business account required for wholesale orders");
  }
  if (account.overduePaused) {
    throw httpError(403, "Account paused due to overdue invoices");
  }
  return account;
}

/**
 * Tier 0: block if unpaid prepaid wholesale exists.
 * Tier ≥1: block if balance + orderTotal exceeds credit limit.
 */
export async function assertWholesaleCreditCapacity(
  account: BusinessAccount,
  orderTotal: number,
) {
  if (account.creditTier === 0) {
    const unpaid = await countUnpaidPrepaidWholesaleOrders(account.id);
    if (unpaid > 0) {
      throw httpError(
        403,
        "Pay your outstanding prepaid wholesale order before placing another (admin mark-paid)",
      );
    }
    return;
  }

  const balance = Number(account.creditBalance);
  const limit = Number(account.creditLimit);
  if (balance + orderTotal > limit) {
    throw httpError(
      403,
      `Order exceeds credit limit (£${limit.toFixed(2)}; balance £${balance.toFixed(2)})`,
    );
  }
}

export async function bumpCreditBalance(businessAccountId: number, amount: number) {
  return incrementCreditBalance(businessAccountId, amount);
}
