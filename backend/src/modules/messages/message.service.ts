import { createMessage, deleteMessageById, listMessages } from "./message.repository.js";

export async function submitMessage(input: { name: string; email: string; subject: string; message: string }) {
  const message = await createMessage(input);
  return { success: true, message };
}

export async function getMessages() {
  return listMessages();
}

export async function removeMessage(id: number) {
  const deleted = await deleteMessageById(id);
  if (!deleted) return null;
  return { success: true, message: "Message deleted successfully" };
}
