import { desc, eq } from "drizzle-orm";
import { messages } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const messageRepository = createGenericRepository(messages, messages.id);

export async function createMessage(data: typeof messages.$inferInsert) {
  return messageRepository.create(data);
}

export async function listMessages() {
  return messageRepository.findMany({ orderBy: desc(messages.createdAt) });
}

export async function deleteMessageById(id: number) {
  return messageRepository.deleteById(id);
}

export const findMessageById = messageRepository.findById;
export const updateMessageById = messageRepository.updateById;
