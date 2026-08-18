import { Router } from "express";
import { createMessageController, deleteMessageController, listMessagesController } from "../controllers/messageController.js";

export const messagesRouter = Router();

messagesRouter.post("/", createMessageController);
messagesRouter.get("/", listMessagesController);
messagesRouter.delete("/:id", deleteMessageController);
