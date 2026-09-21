import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { getMessages, removeMessage, submitMessage } from "./message.service.js";
import { messageSchema } from "./message.validator.js";

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
