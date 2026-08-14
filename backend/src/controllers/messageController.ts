import type { Request, Response } from "express";
import { z } from "zod";
import { getMessages, removeMessage, submitMessage } from "../services/messageService.js";
import { sendError } from "../utils/response.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function createMessageController(req: Request, res: Response) {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Please fill in all required fields.");
  }
  const result = await submitMessage(parsed.data);
  res.status(201).json(result);
}

export async function listMessagesController(_req: Request, res: Response) {
  try {
    const rows = await getMessages();
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to load messages", (err as Error).message);
  }
}

export async function deleteMessageController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return sendError(res, 400, "Invalid message ID");
  const result = await removeMessage(id);
  if (!result) return sendError(res, 404, "Message not found");
  res.json(result);
}
