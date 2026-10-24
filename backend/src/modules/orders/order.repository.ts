import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

export type OrderInsertInput = Prisma.OrderUncheckedCreateInput;
export type OrderItemInsertInput = Prisma.OrderItemUncheckedCreateInput;

export async function createOrder(data: OrderInsertInput) {
  return prisma.order.create({ data });
}

export async function createOrderItems(items: OrderItemInsertInput[]) {
  if (items.length === 0) return [];
  await prisma.orderItem.createMany({ data: items });
  return prisma.orderItem.findMany({
    where: { orderId: { in: [...new Set(items.map((i) => i.orderId))] } },
  });
}

export type ListOrdersFilters = {
  userId?: string;
  pickupDate?: string;
  channel?: "retail" | "wholesale" | "custom";
  status?: string;
};

export async function listOrders(filters: ListOrdersFilters = {}) {
  const where: Prisma.OrderWhereInput = {};
  if (filters.userId) where.userId = filters.userId;
  if (filters.pickupDate) where.pickupDate = filters.pickupDate;
  if (filters.channel) where.channel = filters.channel;
  if (filters.status) where.status = filters.status as never;

  return prisma.order.findMany({
    where: Object.keys(where).length ? where : undefined,
    include: { deliveryNote: true },
    orderBy: [{ pickupTime: "asc" }, { createdAt: "desc" }],
  });
}

export async function listOrderItemsByOrderId(orderId: number) {
  return prisma.orderItem.findMany({ where: { orderId } });
}

export async function listOrderItemsByOrderIds(orderIds: number[]) {
  if (orderIds.length === 0) return [];
  return prisma.orderItem.findMany({
    where: { orderId: { in: orderIds } },
    orderBy: { id: "asc" },
  });
}

export async function findProductImagesByIds(productIds: number[]) {
  if (productIds.length === 0) return new Map<number, string>();
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, image: true },
  });
  return new Map(products.map((p) => [p.id, p.image]));
}

export async function findProductsByIds(productIds: number[]) {
  if (productIds.length === 0) return [];
  return prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
    select: {
      id: true,
      name: true,
      retailPrice: true,
      wholesalePrice: true,
      active: true,
    },
  });
}

export async function findLatestPaymentIntentByOrderId(orderId: number) {
  return prisma.paymentIntent.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
    select: { status: true, provider: true, amount: true, currency: true },
  });
}

export async function updateOrderStatusById(id: number, status: string) {
  return prisma.order
    .update({
      where: { id },
      data: { status: status as never },
      include: { deliveryNote: true },
    })
    .catch(() => null);
}

export async function findDeliveryNoteByOrderId(orderId: number) {
  return prisma.deliveryNote.findUnique({ where: { orderId } });
}

export type CreateDeliveryNoteInput = {
  orderId: number;
  signerName: string;
  medium: "paper" | "digital";
  recordedByUserId: string;
};

export async function createDeliveryNoteAndCompleteOrder(input: CreateDeliveryNoteInput) {
  return prisma.$transaction(async (tx) => {
    await tx.deliveryNote.create({
      data: {
        orderId: input.orderId,
        signerName: input.signerName,
        medium: input.medium,
        recordedByUserId: input.recordedByUserId,
      },
    });
    return tx.order.update({
      where: { id: input.orderId },
      data: { status: "completed" },
      include: { deliveryNote: true },
    });
  });
}

export async function deleteOrderById(id: number) {
  return prisma.order.delete({ where: { id } }).catch(() => null);
}

export const findOrderById = (id: number) =>
  prisma.order.findUnique({
    where: { id },
    include: { deliveryNote: true },
  });
export const findOrdersByCustomerEmail = (email: string) =>
  prisma.order.findMany({ where: { email }, include: { deliveryNote: true } });
