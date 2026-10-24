import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import {
  cancelOrder,
  changeOrderStatus,
  getOrderById,
  getOrdersWithItems,
  markOrderPaid,
  placeOrder,
} from "./order.service.js";
import { markPaidSchema, orderSchema, updateOrderStatusSchema } from "./order.validator.js";

export async function listOrdersController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  try {
    const canViewAll =
      (req.permissions?.includes("view.orders") ?? false) ||
      (req.permissions?.includes("view.production") ?? false);

    const date =
      typeof req.query.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
        ? req.query.date
        : undefined;
    const channelRaw = typeof req.query.channel === "string" ? req.query.channel : undefined;
    const channel =
      channelRaw === "retail" || channelRaw === "wholesale" || channelRaw === "custom"
        ? channelRaw
        : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;

    const rows = await getOrdersWithItems({
      userId: canViewAll ? undefined : req.auth.userId,
      pickupDate: canViewAll ? date : undefined,
      channel: canViewAll ? channel : undefined,
      status: canViewAll ? status : undefined,
    });
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to fetch orders", (err as Error).message);
  }
}

export async function getOrderController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return sendError(res, 400, "Invalid order ID");

  try {
    const order = await getOrderById(id);
    if (!order) return sendError(res, 404, "Order not found");

    const canViewAll =
      (req.permissions?.includes("view.orders") ?? false) ||
      (req.permissions?.includes("view.production") ?? false);
    if (!canViewAll && order.userId !== req.auth.userId) {
      return sendError(res, 403, "Forbidden");
    }

    res.json(order);
  } catch (err) {
    sendError(res, 500, "Failed to fetch order", (err as Error).message);
  }
}

export async function createOrderController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Missing required fields");

  try {
    const order = await placeOrder(parsed.data, req.auth.userId);
    res.status(201).json(order);
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to place order");
  }
}

export async function updateOrderController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  const canUpdate =
    (req.permissions?.includes("view.orders") ?? false) ||
    (req.permissions?.includes("view.production") ?? false);
  if (!canUpdate) return sendError(res, 403, "Forbidden");

  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid order ID");

  const parsed = updateOrderStatusSchema.safeParse(req.body ?? {});
  if (!parsed.success) return sendError(res, 400, "Invalid request body");

  try {
    const updated = await changeOrderStatus(id, parsed.data.status, {
      deliveryNote: parsed.data.deliveryNote ?? null,
      recordedByUserId: req.auth.userId,
    });
    if (!updated) return sendError(res, 404, "Order not found");
    res.json({ success: true, order: updated });
  } catch (err) {
    const code = (err as Error & { status?: number }).status ?? 500;
    sendError(res, code, (err as Error).message || "Failed to update order status");
  }
}

export async function markPaidController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return sendError(res, 400, "Invalid order ID");

  const parsed = markPaidSchema.safeParse(req.body ?? {});
  if (!parsed.success) return sendError(res, 400, "Invalid request body");

  try {
    const updated = await markOrderPaid(id, parsed.data.payment_reference);
    if (!updated) return sendError(res, 404, "Order not found");
    res.json({ success: true, order: updated });
  } catch (err) {
    const status = (err as Error & { status?: number }).status ?? 500;
    sendError(res, status, (err as Error).message || "Failed to mark order paid");
  }
}

export async function deleteOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid order ID");
  const deleted = await cancelOrder(id);
  if (!deleted) return sendError(res, 404, "Order not found");
  res.json({ success: true });
}
