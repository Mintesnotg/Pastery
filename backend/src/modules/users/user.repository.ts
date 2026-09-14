import type { Prisma, User } from "@prisma/client";
import { prisma, type DbClient } from "../../db/index.js";

export function listUsers(options: { limit?: number; offset?: number } = {}) {
  return prisma.user.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: options.limit,
    skip: options.offset,
  });
}

export function countActiveUsers() {
  return prisma.user.count({ where: { active: true } });
}

export async function findUserRoleIdsBatch(userIds: string[]): Promise<Map<string, number[]>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.userRole.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, roleId: true },
  });
  const map = new Map<string, number[]>();
  for (const row of rows) {
    const existing = map.get(row.userId) ?? [];
    existing.push(row.roleId);
    map.set(row.userId, existing);
  }
  return map;
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email } });
}

export function findActiveUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email, active: true } });
}

export function createUser(data: Prisma.UserCreateInput, database: DbClient = prisma) {
  return database.user.create({ data });
}

export function updateUserById(id: string, data: Prisma.UserUpdateInput, database: DbClient = prisma) {
  return database.user.update({ where: { id }, data }).catch(() => null);
}

export function deactivateUserById(id: string, database: DbClient = prisma) {
  return updateUserById(id, { active: false, updatedAt: new Date() }, database);
}

export function updateUserLastLogin(id: string, lastLoginAt: Date, database: DbClient = prisma) {
  return updateUserById(id, { lastLoginAt }, database);
}

export async function findRolesByIds(roleIds: number[], database: DbClient = prisma) {
  if (roleIds.length === 0) return [];
  return database.role.findMany({ where: { id: { in: roleIds } } });
}

export async function replaceUserRoles(userId: string, roleIds: number[], database: DbClient = prisma) {
  const uniqueRoleIds = [...new Set(roleIds)];
  await database.userRole.deleteMany({ where: { userId } });
  if (uniqueRoleIds.length === 0) return;
  await database.userRole.createMany({
    data: uniqueRoleIds.map((roleId) => ({ userId, roleId })),
  });
}

export type { User };
