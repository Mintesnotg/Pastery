import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import {
  cancelOrder,
  changeOrderStatus,
  getOrderById,
  getOrdersWithItems,
  placeOrder,
} from "./order.service.js";
import { orderSchema } from "./order.validator.js";

export async function listOrdersController(req: Request, res: Response) {
  if (!req.auth?.userId) return sendError(res, 401, "Unauthenticated");

  try {
    const canViewAll = req.permissions?.includes("view.orders") ?? false;
    const rows = await getOrdersWithItems(canViewAll ? undefined : req.auth.userId);
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

    const canViewAll = req.permissions?.includes("view.orders") ?? false;
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
    sendError(res, 500, "Failed to place order", (err as Error).message);
  }
}

export async function updateOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid order ID");
  const status = String(req.body?.status ?? "");
  if (!status) return sendError(res, 400, "Status is required");
  const allowed = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;
  if (!allowed.includes(status as (typeof allowed)[number])) {
    return sendError(res, 400, "Invalid status");
  }
  const updated = await changeOrderStatus(id, status);
  if (!updated) return sendError(res, 404, "Order not found");
  res.json({ success: true, order: updated });
}

export async function deleteOrderController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid order ID");
  const deleted = await cancelOrder(id);
  if (!deleted) return sendError(res, 404, "Order not found");
  res.json({ success: true });
}
