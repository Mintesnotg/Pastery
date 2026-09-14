import { prisma } from "../../db/index.js";

export async function pingDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
