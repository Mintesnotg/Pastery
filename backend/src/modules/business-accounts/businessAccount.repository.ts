import type { BusinessApprovalStatus, Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

const contactUserSelect = {
  contactUser: { select: { id: true, email: true, fullName: true } },
} as const;

export function findBusinessAccountByUserId(userId: string) {
  return prisma.businessAccount.findUnique({
    where: { contactUserId: userId },
    include: contactUserSelect,
  });
}

export function findBusinessAccountById(id: number) {
  return prisma.businessAccount.findUnique({
    where: { id },
    include: contactUserSelect,
  });
}

export function listBusinessAccounts(options: {
  status?: BusinessApprovalStatus;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const where: Prisma.BusinessAccountWhereInput = {};
  if (options.status) where.approvalStatus = options.status;
  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { businessName: { contains: q } },
      { postcode: { contains: q } },
      { city: { contains: q } },
      { contactUser: { email: { contains: q } } },
      { contactUser: { fullName: { contains: q } } },
    ];
  }
  return prisma.businessAccount.findMany({
    where,
    include: contactUserSelect,
    orderBy: { createdAt: "desc" },
    take: options.limit,
    skip: options.offset,
  });
}

export function countBusinessAccounts(options: {
  status?: BusinessApprovalStatus;
  search?: string;
} = {}) {
  const where: Prisma.BusinessAccountWhereInput = {};
  if (options.status) where.approvalStatus = options.status;
  if (options.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { businessName: { contains: q } },
      { postcode: { contains: q } },
      { city: { contains: q } },
      { contactUser: { email: { contains: q } } },
      { contactUser: { fullName: { contains: q } } },
    ];
  }
  return prisma.businessAccount.count({ where });
}

export function createBusinessAccount(data: Prisma.BusinessAccountCreateInput) {
  return prisma.businessAccount.create({ data, include: contactUserSelect });
}

export function updateBusinessAccount(id: number, data: Prisma.BusinessAccountUpdateInput) {
  return prisma.businessAccount
    .update({ where: { id }, data, include: contactUserSelect })
    .catch(() => null);
}

export function findCafeRole() {
  return prisma.role.findUnique({ where: { key: "cafe" } });
}

export function findUserRole(userId: string, roleId: number) {
  return prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });
}

export function assignUserRole(userId: string, roleId: number) {
  return prisma.userRole.create({ data: { userId, roleId } });
}

/** Unpaid prepaid wholesale orders that block Tier 0 from placing again. */
export function countUnpaidPrepaidWholesaleOrders(businessAccountId: number) {
  return prisma.order.count({
    where: {
      businessAccountId,
      channel: "wholesale",
      paymentTerms: "prepaid",
      prepaidPaidAt: null,
      status: { not: "cancelled" },
    },
  });
}

export function incrementCreditBalance(businessAccountId: number, amount: number) {
  return prisma.businessAccount.update({
    where: { id: businessAccountId },
    data: { creditBalance: { increment: amount } },
  });
}
