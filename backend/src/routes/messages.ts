import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { messages } from "../db/schema.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { sendError } from "../utils/response.js";

export const messagesRouter = Router();

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

messagesRouter.post("/", async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Please fill in all required fields.");
  }
  const [created] = await db.insert(messages).values(parsed.data).returning();
  res.status(201).json({ success: true, message: created });
});

messagesRouter.get("/", requireAuth, requirePermission("messages.read"), async (_req, res) => {
  try {
    const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to load messages", (err as Error).message);
  }
});

messagesRouter.delete("/:id", requireAuth, requirePermission("messages.delete"), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid message ID");
  const [deleted] = await db.delete(messages).where(eq(messages.id, id)).returning();
  if (!deleted) return sendError(res, 404, "Message not found");
  res.json({ success: true });
});
