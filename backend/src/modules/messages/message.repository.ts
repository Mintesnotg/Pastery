import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

export async function createMessage(data: Prisma.MessageCreateInput) {
  return prisma.message.create({ data });
}

export async function listMessages() {
  return prisma.message.findMany({ orderBy: { createdAt: "desc" } });
}

export async function deleteMessageById(id: number) {
  return prisma.message.delete({ where: { id } }).catch(() => null);
}

export const findMessageById = (id: number) => prisma.message.findUnique({ where: { id } });
export const updateMessageById = (id: number, data: Prisma.MessageUpdateInput) =>
  prisma.message.update({ where: { id }, data }).catch(() => null);
