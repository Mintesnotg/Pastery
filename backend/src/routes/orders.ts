import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { orderItems, orders } from "../db/schema.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { sendError } from "../utils/response.js";

export const ordersRouter = Router();

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

ordersRouter.get("/", requireAuth, requirePermission("orders.read"), async (_req, res) => {
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const withItems = await Promise.all(rows.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    }));
    res.json(withItems);
  } catch (err) {
    sendError(res, 500, "Failed to fetch orders", (err as Error).message);
  }
});

ordersRouter.post("/", async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Missing required fields");
  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [order] = await db.insert(orders).values({
    customerName: parsed.data.customerName,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    pickupDate: parsed.data.pickupDate,
    pickupTime: parsed.data.pickupTime,
    notes: parsed.data.notes || null,
    subtotal: subtotal.toFixed(2),
    total: parsed.data.total.toFixed(2),
  }).returning();
  await db.insert(orderItems).values(parsed.data.items.map((item) => ({
    orderId: order.id,
    productId: item.id ?? null,
    productName: item.name,
    unitPrice: item.price.toFixed(2),
    quantity: item.qty,
    lineTotal: (item.price * item.qty).toFixed(2),
    metadata: { source: "checkout" },
  })));
  res.status(201).json({ success: true, order });
});

ordersRouter.put("/:id", requireAuth, requirePermission("orders.write"), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid order ID");
  const status = String(req.body?.status ?? "");
  if (!status) return sendError(res, 400, "Status is required");
  const allowed = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"] as const;
  if (!allowed.includes(status as (typeof allowed)[number])) {
    return sendError(res, 400, "Invalid status");
  }
  const [updated] = await db.update(orders).set({ status: status as any }).where(eq(orders.id, id)).returning();
  if (!updated) return sendError(res, 404, "Order not found");
  res.json({ success: true, order: updated });
});

ordersRouter.delete("/:id", requireAuth, requirePermission("orders.delete"), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid order ID");
  const [deleted] = await db.delete(orders).where(eq(orders.id, id)).returning();
  if (!deleted) return sendError(res, 404, "Order not found");
  res.json({ success: true });
});
