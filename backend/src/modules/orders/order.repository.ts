import { desc, eq } from "drizzle-orm";
import { createGenericRepository } from "../../shared/repositories/generic.repository.js";
import { orderItems, orders } from "./order.schema.js";

export type OrderInsertInput = typeof orders.$inferInsert;
export type OrderItemInsertInput = typeof orderItems.$inferInsert;

const orderRepository = createGenericRepository(orders, orders.id);
const orderItemRepository = createGenericRepository(orderItems, orderItems.id);

export async function createOrder(data: OrderInsertInput) {
  return orderRepository.create(data);
}

export async function createOrderItems(items: OrderItemInsertInput[]) {
  return orderItemRepository.createMany(items);
}

export async function listOrders() {
  return orderRepository.findMany({ orderBy: desc(orders.createdAt) });
}

export async function listOrderItemsByOrderId(orderId: number) {
  return orderItemRepository.findMany({ where: eq(orderItems.orderId, orderId) });
}

export async function updateOrderStatusById(id: number, status: string) {
  return orderRepository.updateById(id, { status: status as OrderInsertInput["status"] });
}

export async function deleteOrderById(id: number) {
  return orderRepository.deleteById(id);
}

export const findOrderById = orderRepository.findById;
export const findOrdersByCustomerEmail = (email: string) =>
  orderRepository.findMany({ where: eq(orders.email, email) });
