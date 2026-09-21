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

export async function listOrders() {
  return prisma.order.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listOrderItemsByOrderId(orderId: number) {
  return prisma.orderItem.findMany({ where: { orderId } });
}

export async function updateOrderStatusById(id: number, status: string) {
  return prisma.order
    .update({
      where: { id },
      data: { status: status as never },
    })
    .catch(() => null);
}

export async function deleteOrderById(id: number) {
  return prisma.order.delete({ where: { id } }).catch(() => null);
}

export const findOrderById = (id: number) => prisma.order.findUnique({ where: { id } });
export const findOrdersByCustomerEmail = (email: string) =>
  prisma.order.findMany({ where: { email } });
