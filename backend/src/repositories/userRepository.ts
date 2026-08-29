import { and, eq } from "drizzle-orm";
import { users } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const userRepository = createGenericRepository(users, users.id);

export async function findUserByEmail(email: string) {
  return userRepository.findOne(eq(users.email, email));
}

export async function findUserById(id: string) {
  return userRepository.findById(id);
}

export async function findActiveUserByEmail(email: string) {
  return userRepository.findOne(and(eq(users.email, email), eq(users.active, true)));
}

export async function createUser(data: typeof users.$inferInsert) {
  return userRepository.create(data);
}

export async function updateUserLastLogin(id: string, lastLoginAt: Date) {
  return userRepository.updateById(id, { lastLoginAt });
}
