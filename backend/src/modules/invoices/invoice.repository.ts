import type { InvoicePaymentMethod, InvoiceStatus, Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

const invoiceInclude = {
  businessAccount: {
    select: {
      id: true,
      businessName: true,
      creditTier: true,
      contactUserId: true,
      contactUser: { select: { id: true, email: true, fullName: true } },
    },
  },
  lines: { orderBy: { fulfillmentDate: "asc" as const } },
  payments: { orderBy: { paidAt: "desc" as const } },
} satisfies Prisma.InvoiceInclude;

export type InvoiceWithDetails = Prisma.InvoiceGetPayload<{ include: typeof invoiceInclude }>;

export async function findBillableOrdersForWeek(input: {
  periodStart: string;
  periodEnd: string;
  businessAccountId?: number;
}) {
  return prisma.order.findMany({
    where: {
      channel: "wholesale",
      paymentTerms: "credit",
      status: "completed",
      businessAccountId: input.businessAccountId
        ? input.businessAccountId
        : { not: null },
      pickupDate: { gte: input.periodStart, lte: input.periodEnd },
      invoiceLine: null,
    },
    include: {
      businessAccount: {
        select: {
          id: true,
          businessName: true,
          creditTier: true,
          contactUserId: true,
        },
      },
    },
    orderBy: [{ businessAccountId: "asc" }, { pickupDate: "asc" }, { id: "asc" }],
  });
}

export async function findExistingInvoiceForPeriod(
  businessAccountId: number,
  periodStart: Date,
) {
  return prisma.invoice.findUnique({
    where: {
      businessAccountId_periodStart: { businessAccountId, periodStart },
    },
  });
}

export type CreateInvoiceLineInput = {
  orderId: number;
  description: string;
  amount: number;
  fulfillmentDate: string;
};

export async function createInvoiceWithLines(input: {
  businessAccountId: number;
  invoiceNumber: string;
  periodStart: Date;
  periodEnd: Date;
  invoiceDate: Date;
  dueDate: Date;
  subtotal: number;
  createdByUserId: string;
  lines: CreateInvoiceLineInput[];
}) {
  return prisma.invoice.create({
    data: {
      businessAccountId: input.businessAccountId,
      invoiceNumber: input.invoiceNumber,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      invoiceDate: input.invoiceDate,
      dueDate: input.dueDate,
      subtotal: input.subtotal.toFixed(2),
      amountPaid: 0,
      currency: "GBP",
      status: "open",
      createdByUserId: input.createdByUserId,
      lines: {
        create: input.lines.map((line) => ({
          orderId: line.orderId,
          description: line.description,
          amount: line.amount.toFixed(2),
          fulfillmentDate: line.fulfillmentDate,
        })),
      },
    },
    include: invoiceInclude,
  });
}

export async function listInvoices(filters: {
  businessAccountId?: number;
  status?: InvoiceStatus;
} = {}) {
  const where: Prisma.InvoiceWhereInput = {};
  if (filters.businessAccountId != null) where.businessAccountId = filters.businessAccountId;
  if (filters.status) where.status = filters.status;

  return prisma.invoice.findMany({
    where,
    include: invoiceInclude,
    orderBy: [{ invoiceDate: "desc" }, { id: "desc" }],
  });
}

export async function findInvoiceById(id: number) {
  return prisma.invoice.findUnique({
    where: { id },
    include: invoiceInclude,
  });
}

export async function createPaymentAndUpdateInvoice(input: {
  invoiceId: number;
  amount: number;
  reference?: string | null;
  method: InvoicePaymentMethod;
  recordedByUserId: string;
  newAmountPaid: number;
  newStatus: InvoiceStatus;
  businessAccountId: number;
  creditDecrement: number;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.invoicePayment.create({
      data: {
        invoiceId: input.invoiceId,
        amount: input.amount.toFixed(2),
        reference: input.reference?.trim() || null,
        method: input.method,
        recordedByUserId: input.recordedByUserId,
      },
    });

    const invoice = await tx.invoice.update({
      where: { id: input.invoiceId },
      data: {
        amountPaid: input.newAmountPaid.toFixed(2),
        status: input.newStatus,
      },
      include: invoiceInclude,
    });

    if (input.creditDecrement > 0) {
      const account = await tx.businessAccount.findUnique({
        where: { id: input.businessAccountId },
        select: { creditBalance: true },
      });
      const current = Number(account?.creditBalance ?? 0);
      const next = Math.max(0, current - input.creditDecrement);
      await tx.businessAccount.update({
        where: { id: input.businessAccountId },
        data: { creditBalance: next.toFixed(2) },
      });
    }

    return invoice;
  });
}

export async function voidInvoiceById(id: number) {
  return prisma.invoice.update({
    where: { id },
    data: { status: "void" },
    include: invoiceInclude,
  });
}

export async function findBusinessAccountIdByUserId(userId: string) {
  const account = await prisma.businessAccount.findUnique({
    where: { contactUserId: userId },
    select: { id: true },
  });
  return account?.id ?? null;
}
