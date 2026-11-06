import { prisma } from "../db/index.js";
import { ensureAdmin } from "./ensure-admin.js";

try {
  await ensureAdmin();
  console.log("Admin account is ready.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

process.exit(process.exitCode ?? 0);
