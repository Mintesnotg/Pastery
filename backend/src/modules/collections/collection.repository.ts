import type { CollectionTaskStatus, Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

const taskInclude = {
  businessAccount: {
    select: {
      id: true,
      businessName: true,
      creditTier: true,
      lateStrikeCount: true,
      overduePaused: true,
      contactUser: { select: { id: true, email: true, fullName: true } },
    },
  },
  invoice: {
    select: {
      id: true,
      invoiceNumber: true,
      dueDate: true,
      subtotal: true,
      amountPaid: true,
      status: true,
    },
  },
} satisfies Prisma.CollectionTaskInclude;

export type CollectionTaskWithDetails = Prisma.CollectionTaskGetPayload<{
  include: typeof taskInclude;
}>;

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function findOpenInvoicesDueOn(dueYmd: string) {
  return prisma.invoice.findMany({
    where: {
      status: "open",
      dueDate: parseYmd(dueYmd),
    },
    include: {
      businessAccount: {
        select: {
          id: true,
          businessName: true,
          contactUser: { select: { email: true, fullName: true } },
        },
      },
    },
  });
}

export async function findOpenInvoicesOverdueBy(asOfYmd: string, minDaysOverdue: number) {
  const cutoff = parseYmd(asOfYmd);
  cutoff.setUTCDate(cutoff.getUTCDate() - minDaysOverdue);
  return prisma.invoice.findMany({
    where: {
      status: "open",
      dueDate: { lte: cutoff },
    },
    include: {
      businessAccount: {
        select: {
          id: true,
          businessName: true,
          overduePaused: true,
          lateStrikeCount: true,
          contactUser: { select: { email: true, fullName: true } },
        },
      },
      collectionTask: true,
    },
  });
}

export async function stampInvoiceReminder(
  invoiceId: number,
  kind: "pre_due" | "due",
) {
  const now = new Date();
  return prisma.invoice.update({
    where: { id: invoiceId },
    data:
      kind === "pre_due"
        ? { reminderPreDueSentAt: now }
        : { reminderDueSentAt: now },
  });
}

export async function createOverduePauseTask(input: {
  businessAccountId: number;
  invoiceId: number;
  daysOverdue: number;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.collectionTask.findUnique({
      where: { invoiceId: input.invoiceId },
    });
    if (existing) {
      await tx.businessAccount.update({
        where: { id: input.businessAccountId },
        data: { overduePaused: true },
      });
      return { task: existing, created: false };
    }

    const task = await tx.collectionTask.create({
      data: {
        businessAccountId: input.businessAccountId,
        invoiceId: input.invoiceId,
        kind: "overdue_pause",
        status: "open",
        daysOverdue: input.daysOverdue,
      },
    });

    await tx.businessAccount.update({
      where: { id: input.businessAccountId },
      data: {
        overduePaused: true,
        lateStrikeCount: { increment: 1 },
      },
    });

    return { task, created: true };
  });
}

export async function listCollectionTasks(filters: {
  status?: CollectionTaskStatus;
  businessAccountId?: number;
} = {}) {
  const where: Prisma.CollectionTaskWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.businessAccountId != null) {
    where.businessAccountId = filters.businessAccountId;
  }
  return prisma.collectionTask.findMany({
    where,
    include: taskInclude,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function findCollectionTaskById(id: number) {
  return prisma.collectionTask.findUnique({
    where: { id },
    include: taskInclude,
  });
}

export async function resolveCollectionTaskById(
  id: number,
  resolvedByUserId: string,
  notes?: string | null,
) {
  return prisma.collectionTask.update({
    where: { id },
    data: {
      status: "resolved",
      resolvedAt: new Date(),
      resolvedByUserId,
      notes: notes?.trim() || undefined,
    },
    include: taskInclude,
  });
}

export async function countOpenOverdueInvoices(
  businessAccountId: number,
  asOfYmd: string,
) {
  const asOf = parseYmd(asOfYmd);
  return prisma.invoice.count({
    where: {
      businessAccountId,
      status: "open",
      dueDate: { lt: asOf },
    },
  });
}

export async function clearAccountOverduePause(businessAccountId: number) {
  return prisma.businessAccount.update({
    where: { id: businessAccountId },
    data: { overduePaused: false },
  });
}

export async function resolveOpenTasksForInvoice(invoiceId: number) {
  return prisma.collectionTask.updateMany({
    where: { invoiceId, status: "open" },
    data: { status: "resolved", resolvedAt: new Date() },
  });
}

export async function downgradeAccountTier0(businessAccountId: number) {
  return prisma.businessAccount.update({
    where: { id: businessAccountId },
    data: { creditTier: 0 },
    include: {
      contactUser: { select: { id: true, email: true, fullName: true } },
    },
  });
}

export async function findBusinessAccountById(id: number) {
  return prisma.businessAccount.findUnique({
    where: { id },
    include: {
      contactUser: { select: { id: true, email: true, fullName: true } },
    },
  });
}
