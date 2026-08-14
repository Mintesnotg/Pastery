import type { Request, Response } from "express";
import { z } from "zod";
import { sendError } from "../utils/response.js";
import { cancelOrder, changeOrderStatus, getOrdersWithItems, placeOrder } from "../services/orderService.js";

const itemSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
});

const orderSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  pickupDate: z.string().min(1),
  pickupTime: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(itemSchema).min(1),
  total: z.number().nonnegative(),
});

export async function listOrdersController(_req: Request, res: Response) {
  try {
    const rows = await getOrdersWithItems();
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to fetch orders", (err as Error).message);
  }
}

export async function createOrderController(req: Request, res: Response) {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Missing required fields");
  const order = await placeOrder(parsed.data);
  res.status(201).json(order);
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
