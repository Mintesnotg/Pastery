import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { createMessageController, deleteMessageController, listMessagesController } from "../controllers/messageController.js";

export const messagesRouter = Router();

messagesRouter.post("/", createMessageController);
messagesRouter.get("/", requireAuth, requirePermission("messages.read"), listMessagesController);
messagesRouter.delete("/:id", requireAuth, requirePermission("messages.delete"), deleteMessageController);
