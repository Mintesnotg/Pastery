import { desc, eq } from "drizzle-orm";
import { users, RecordStatus } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const userRepository = createGenericRepository(users, users.id);

export function listUsers() {
  return userRepository.findMany({ where: eq(users.active, true), orderBy: desc(users.createdAt) });
}

export function findUserById(id: string) {
  return userRepository.findById(id);
}

export function findUserByEmail(email: string) {
  return userRepository.findOne(eq(users.email, email));
}

export function findActiveUserByEmail(email: string) {
  return userRepository.findOne(eq(users.email, email));
}

export function createUser(data: typeof users.$inferInsert) {
  return userRepository.create(data);
}

export function updateUserById(id: string, data: Partial<typeof users.$inferInsert>) {
  return userRepository.updateById(id, data);
}

export function deactivateUserById(id: string) {
  return userRepository.updateById(id, { active: false, updatedAt: new Date() } as Partial<typeof users.$inferInsert>);
}

export function updateUserLastLogin(id: string, lastLoginAt: Date) {
  return userRepository.updateById(id, { lastLoginAt } as Partial<typeof users.$inferInsert>);
}
