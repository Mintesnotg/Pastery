import { prisma } from "../../db/index.js";
import {
  assertCanPlaceWholesaleOrder,
  assertWholesaleCreditCapacity,
} from "../business-accounts/businessAccount.service.js";
import { assertFulfillmentWindow } from "../settings/setting.service.js";
import {
  createDeliveryNoteAndCompleteOrder,
  deleteOrderById,
  findDeliveryNoteByOrderId,
  findLatestPaymentIntentByOrderId,
  findOrderById,
  findProductImagesByIds,
  findProductsByIds,
  listOrderItemsByOrderId,
  listOrderItemsByOrderIds,
  listOrders,
  updateOrderStatusById,
} from "./order.repository.js";

export type OrderItemInput = {
  id: number;
  name?: string;
  price?: number;
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
  total?: number;
  channel?: "retail" | "wholesale";
  fulfillmentType?: "pickup" | "delivery";
  deliveryAddress?: string | null;
  standingOrderId?: number | null;
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

function httpError(status: number, message: string): Error & { status: number } {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}

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

export type OrderListFilters = {
  userId?: string;
  pickupDate?: string;
  channel?: "retail" | "wholesale" | "custom";
  status?: string;
};

const STATUS_PIPELINE = ["pending", "confirmed", "preparing", "ready", "completed"] as const;

export function assertOrderStatusTransition(from: string, to: string) {
  if (from === to) {
    throw httpError(400, "Order already has this status");
  }
  if (from === "cancelled" || from === "completed") {
    throw httpError(400, "Cannot change status of a terminal order");
  }
  if (to === "cancelled") return;

  const fromIdx = STATUS_PIPELINE.indexOf(from as (typeof STATUS_PIPELINE)[number]);
  const toIdx = STATUS_PIPELINE.indexOf(to as (typeof STATUS_PIPELINE)[number]);
  if (fromIdx < 0 || toIdx < 0 || toIdx <= fromIdx) {
    throw httpError(400, `Invalid status transition from ${from} to ${to}`);
  }
}

export async function getOrdersWithItems(filters: OrderListFilters = {}) {
  const rows = await listOrders(filters);
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
  await assertFulfillmentWindow(input.pickupDate);

  const channel = input.channel === "wholesale" ? "wholesale" : "retail";
  const fulfillmentType = input.fulfillmentType === "delivery" ? "delivery" : "pickup";
  const deliveryAddress =
    fulfillmentType === "delivery" ? (input.deliveryAddress?.trim() || null) : null;

  if (fulfillmentType === "delivery" && !deliveryAddress) {
    throw httpError(400, "deliveryAddress is required for delivery");
  }

  let businessAccountId: number | null = null;
  let paymentTerms: "prepaid" | "credit" = "prepaid";
  let accountForCredit: Awaited<ReturnType<typeof assertCanPlaceWholesaleOrder>> | null =
    null;

  if (channel === "wholesale") {
    accountForCredit = await assertCanPlaceWholesaleOrder(userId);
    businessAccountId = accountForCredit.id;
    paymentTerms = accountForCredit.creditTier >= 1 ? "credit" : "prepaid";
  }

  const productIds = [...new Set(input.items.map((item) => item.id))];
  const products = await findProductsByIds(productIds);
  const byId = new Map(products.map((p) => [p.id, p]));

  if (products.length !== productIds.length) {
    throw httpError(400, "One or more products were not found or are inactive");
  }

  const pricedItems = input.items.map((item) => {
    const product = byId.get(item.id)!;
    let unitPrice: number;
    if (channel === "wholesale") {
      if (product.wholesalePrice == null) {
        throw httpError(400, `Product "${product.name}" has no wholesale price`);
      }
      unitPrice = Number(product.wholesalePrice);
    } else {
      unitPrice = Number(product.retailPrice);
    }
    const lineTotal = unitPrice * item.qty;
    return {
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity: item.qty,
      lineTotal,
    };
  });

  const orderTotal = pricedItems.reduce((sum, row) => sum + row.lineTotal, 0);

  if (channel === "wholesale" && accountForCredit) {
    await assertWholesaleCreditCapacity(accountForCredit, orderTotal);
  }

  const order = await prisma.$transaction(async (tx) => {
    if (channel === "wholesale" && accountForCredit && paymentTerms === "credit") {
      await tx.businessAccount.update({
        where: { id: accountForCredit.id },
        data: { creditBalance: { increment: orderTotal } },
      });
    }

    const created = await tx.order.create({
      data: {
        userId,
        customerName: input.customerName,
        email: input.email,
        phone: input.phone || null,
        pickupDate: input.pickupDate,
        pickupTime: input.pickupTime,
        notes: input.notes || null,
        total: orderTotal.toFixed(2),
        channel,
        fulfillmentType,
        paymentTerms,
        businessAccountId,
        deliveryAddress,
        standingOrderId: input.standingOrderId ?? null,
      },
    });

    await tx.orderItem.createMany({
      data: pricedItems.map((item) => ({
        orderId: created.id,
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice.toFixed(2),
        quantity: item.quantity,
        lineTotal: item.lineTotal.toFixed(2),
      })),
    });

    return created;
  });

  return { success: true, order };
}

export async function markOrderPaid(
  id: number,
  paymentReference?: string | null,
) {
  const order = await findOrderById(id);
  if (!order) return null;

  if (order.paymentTerms !== "prepaid") {
    throw httpError(400, "Only prepaid orders can be marked paid");
  }
  if (order.prepaidPaidAt) {
    throw httpError(400, "Order is already marked paid");
  }
  if (order.status === "cancelled") {
    throw httpError(400, "Cancelled orders cannot be marked paid");
  }

  return prisma.order.update({
    where: { id },
    data: {
      prepaidPaidAt: new Date(),
      paymentReference: paymentReference?.trim() || null,
    },
  });
}

export type DeliveryNoteInput = {
  signerName: string;
  medium: "paper" | "digital";
};

export async function changeOrderStatus(
  id: number,
  status: string,
  opts: { deliveryNote?: DeliveryNoteInput | null; recordedByUserId?: string } = {},
) {
  const order = await findOrderById(id);
  if (!order) return null;
  assertOrderStatusTransition(order.status, status);

  if (status === "completed" && order.fulfillmentType === "delivery") {
    const existing = order.deliveryNote ?? (await findDeliveryNoteByOrderId(id));
    if (existing) {
      return updateOrderStatusById(id, status);
    }

    const note = opts.deliveryNote;
    if (!note?.signerName?.trim()) {
      throw httpError(400, "Delivery note (signer name) is required to complete a delivery order");
    }
    if (note.medium !== "paper" && note.medium !== "digital") {
      throw httpError(400, "Delivery note medium must be paper or digital");
    }
    if (!opts.recordedByUserId) {
      throw httpError(401, "Unauthenticated");
    }

    return createDeliveryNoteAndCompleteOrder({
      orderId: id,
      signerName: note.signerName.trim(),
      medium: note.medium,
      recordedByUserId: opts.recordedByUserId,
    });
  }

  return updateOrderStatusById(id, status);
}

export async function cancelOrder(id: number) {
  return deleteOrderById(id);
}
