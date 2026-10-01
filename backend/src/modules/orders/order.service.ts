import {
  createOrder,
  createOrderItems,
  deleteOrderById,
  findLatestPaymentIntentByOrderId,
  findOrderById,
  findProductImagesByIds,
  listOrderItemsByOrderId,
  listOrderItemsByOrderIds,
  listOrders,
  updateOrderStatusById,
} from "./order.repository.js";

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

type OrderItemRow = {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  unitPrice: unknown;
  quantity: number;
  lineTotal: unknown;
  createdAt: Date;
};

async function enrichItemsWithProductImages(items: OrderItemRow[]) {
  const productIds = [
    ...new Set(items.map((item) => item.productId).filter((id): id is number => id != null)),
  ];
  const imageMap = await findProductImagesByIds(productIds);
  return items.map((item) => ({
    ...item,
    productImage: item.productId != null ? (imageMap.get(item.productId) ?? null) : null,
  }));
}

export async function getOrdersWithItems(userId?: string) {
  const rows = await listOrders(userId);
  const orderIds = rows.map((order) => order.id);
  const allItems = await listOrderItemsByOrderIds(orderIds);
  const enrichedItems = await enrichItemsWithProductImages(allItems);
  const itemsByOrderId = new Map<number, typeof enrichedItems>();
  for (const item of enrichedItems) {
    const list = itemsByOrderId.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrderId.set(item.orderId, list);
  }
  return rows.map((order) => ({
    ...order,
    items: itemsByOrderId.get(order.id) ?? [],
  }));
}

export async function getOrderById(id: number) {
  const order = await findOrderById(id);
  if (!order) return null;

  const items = await listOrderItemsByOrderId(order.id);
  const enrichedItems = await enrichItemsWithProductImages(items);
  const paymentIntent = await findLatestPaymentIntentByOrderId(order.id);

  return {
    ...order,
    items: enrichedItems,
    payment: paymentIntent
      ? {
          status: paymentIntent.status,
          provider: paymentIntent.provider,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        }
      : null,
  };
}

export async function placeOrder(input: OrderInput, userId: string) {
  const order = await createOrder({
    userId,
    customerName: input.customerName,
    email: input.email,
    phone: input.phone || null,
    pickupDate: input.pickupDate,
    pickupTime: input.pickupTime,
    notes: input.notes || null,
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
    })),
  );
  return { success: true, order };
}

export async function changeOrderStatus(id: number, status: string) {
  return updateOrderStatusById(id, status);
}

export async function cancelOrder(id: number) {
  return deleteOrderById(id);
}
