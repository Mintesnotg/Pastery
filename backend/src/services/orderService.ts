import { createOrder, createOrderItems, deleteOrderById, listOrderItemsByOrderId, listOrders, updateOrderStatusById } from "../repositories/orderRepository.js";

export type OrderItemInput = {
  id?: number;
  name: string;
  price: number;
  qty: number;
};

export type OrderInput = {
  customerName: string;
  email: string;
  phone?: string | null;
  pickupDate: string;
  pickupTime: string;
  notes?: string | null;
  items: OrderItemInput[];
  total: number;
};

export async function getOrdersWithItems() {
  const rows = await listOrders();
  return Promise.all(
    rows.map(async (order: { id: number }) => ({ ...order, items: await listOrderItemsByOrderId(order.id) }))
  );
}

export async function placeOrder(input: OrderInput) {
  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const order = await createOrder({
    customerName: input.customerName,
    email: input.email,
    phone: input.phone || null,
    pickupDate: input.pickupDate,
    pickupTime: input.pickupTime,
    notes: input.notes || null,
    subtotal: subtotal.toFixed(2),
    total: input.total.toFixed(2),
  });
  await createOrderItems(
    input.items.map((item) => ({
      orderId: order.id as number,
      productId: item.id ?? null,
      productName: item.name,
      unitPrice: item.price.toFixed(2),
      quantity: item.qty,
      lineTotal: (item.price * item.qty).toFixed(2),
      metadata: { source: "checkout" },
    }))
  );
  return { success: true, order };
}

export async function changeOrderStatus(id: number, status: string) {
  const order = await updateOrderStatusById(id, status);
  return order;
}

export async function cancelOrder(id: number) {
  const order = await deleteOrderById(id);
  return order;
}
