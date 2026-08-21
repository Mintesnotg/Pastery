import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { roles, userRoles, users } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const userRepository = createGenericRepository(users, users.id);
type DbLike = Pick<typeof db, "select" | "insert" | "delete" | "update">;

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

export function createUser(data: typeof users.$inferInsert, database: DbLike = db) {
  return database.insert(users).values(data).returning().then((rows) => rows[0] ?? null);
}

export function updateUserById(id: string, data: Partial<typeof users.$inferInsert>, database: DbLike = db) {
  return database.update(users).set(data).where(eq(users.id, id)).returning().then((rows) => rows[0] ?? null);
}

export function deactivateUserById(id: string, database: DbLike = db) {
  return updateUserById(id, { active: false, updatedAt: new Date() } as Partial<typeof users.$inferInsert>, database);
}

export function updateUserLastLogin(id: string, lastLoginAt: Date, database: DbLike = db) {
  return updateUserById(id, { lastLoginAt } as Partial<typeof users.$inferInsert>, database);
}

export async function findRolesByIds(roleIds: number[], database: DbLike = db) {
  if (roleIds.length === 0) return [];
  return database.select().from(roles).where(inArray(roles.id, roleIds));
}

export async function replaceUserRoles(userId: string, roleIds: number[], database: DbLike = db) {
  const uniqueRoleIds = [...new Set(roleIds)];
  await database.delete(userRoles).where(eq(userRoles.userId, userId));
  if (uniqueRoleIds.length === 0) return;
  await database.insert(userRoles).values(uniqueRoleIds.map((roleId) => ({ userId, roleId })));
}
