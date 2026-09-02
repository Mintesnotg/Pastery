import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { createGenericRepository } from "../../shared/repositories/generic.repository.js";
import { roles, userRoles } from "../roles/role.schema.js";
import { users } from "./user.schema.js";

const userRepository = createGenericRepository(users, users.id);
type DbLike = Pick<typeof db, "select" | "insert" | "delete" | "update">;

export function listUsers(options: { limit?: number; offset?: number } = {}) {
  return userRepository.findMany({ where: eq(users.active, true), orderBy: desc(users.createdAt), ...options });
}

export function countActiveUsers() {
  return userRepository.count(eq(users.active, true));
}

export async function findUserRoleIdsBatch(userIds: string[]): Promise<Map<string, number[]>> {
  if (userIds.length === 0) return new Map();
  const rows = await db
    .select({ userId: userRoles.userId, roleId: userRoles.roleId })
    .from(userRoles)
    .where(inArray(userRoles.userId, userIds));
  const map = new Map<string, number[]>();
  for (const row of rows) {
    const existing = map.get(row.userId) ?? [];
    existing.push(row.roleId);
    map.set(row.userId, existing);
  }
  return map;
}

export function findUserById(id: string) {
  return userRepository.findById(id);
}

export function findUserByEmail(email: string) {
  return userRepository.findOne(eq(users.email, email));
}

export function findActiveUserByEmail(email: string) {
  return userRepository.findOne(and(eq(users.email, email), eq(users.active, true)));
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
