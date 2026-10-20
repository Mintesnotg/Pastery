import { prisma } from "../../db/index.js";
import type { FulfillmentType, Prisma } from "@prisma/client";

const includeItems = {
  items: { include: { product: { select: { id: true, name: true, wholesalePrice: true } } } },
  businessAccount: { select: { id: true, businessName: true } },
  user: { select: { id: true, email: true, fullName: true } },
} satisfies Prisma.StandingOrderInclude;

export function listStandingOrdersByUser(userId: string) {
  return prisma.standingOrder.findMany({
    where: { userId },
    include: includeItems,
    orderBy: { id: "desc" },
  });
}

export function listAllStandingOrders(businessAccountId?: number) {
  return prisma.standingOrder.findMany({
    where: businessAccountId ? { businessAccountId } : undefined,
    include: includeItems,
    orderBy: { id: "desc" },
  });
}

export function findStandingOrderById(id: number) {
  return prisma.standingOrder.findUnique({
    where: { id },
    include: includeItems,
  });
}

export function createStandingOrder(data: {
  businessAccountId: number;
  userId: string;
  weekdays: number[];
  fulfillmentType: FulfillmentType;
  deliveryAddress: string | null;
  preferredTime: string;
  notes: string | null;
  items: { productId: number; quantity: number }[];
}) {
  return prisma.standingOrder.create({
    data: {
      businessAccountId: data.businessAccountId,
      userId: data.userId,
      weekdays: data.weekdays,
      fulfillmentType: data.fulfillmentType,
      deliveryAddress: data.deliveryAddress,
      preferredTime: data.preferredTime,
      notes: data.notes,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: includeItems,
  });
}

export async function updateStandingOrder(
  id: number,
  data: {
    weekdays?: number[];
    fulfillmentType?: FulfillmentType;
    deliveryAddress?: string | null;
    preferredTime?: string;
    notes?: string | null;
    active?: boolean;
    items?: { productId: number; quantity: number }[];
  },
) {
  return prisma.$transaction(async (tx) => {
    if (data.items) {
      await tx.standingOrderItem.deleteMany({ where: { standingOrderId: id } });
      await tx.standingOrderItem.createMany({
        data: data.items.map((item) => ({
          standingOrderId: id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    }

    return tx.standingOrder.update({
      where: { id },
      data: {
        ...(data.weekdays !== undefined ? { weekdays: data.weekdays } : {}),
        ...(data.fulfillmentType !== undefined ? { fulfillmentType: data.fulfillmentType } : {}),
        ...(data.deliveryAddress !== undefined ? { deliveryAddress: data.deliveryAddress } : {}),
        ...(data.preferredTime !== undefined ? { preferredTime: data.preferredTime } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
      include: includeItems,
    });
  });
}

export function deactivateStandingOrder(id: number) {
  return prisma.standingOrder.update({
    where: { id },
    data: { active: false },
    include: includeItems,
  });
}

export function listActiveStandingOrdersForGenerate() {
  return prisma.standingOrder.findMany({
    where: { active: true },
    include: {
      items: true,
      businessAccount: true,
      user: { select: { id: true, email: true, fullName: true } },
    },
  });
}

export function findOrderByStandingAndDate(standingOrderId: number, pickupDate: string) {
  return prisma.order.findFirst({
    where: { standingOrderId, pickupDate, status: { not: "cancelled" } },
  });
}
