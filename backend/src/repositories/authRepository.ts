import { eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { permissions, rolePermissions, roles, userRoles } from "../db/schema.js";

export async function findRoleByKey(key: string) {
  const [role] = await db.select().from(roles).where(eq(roles.key, key)).limit(1);
  return role ?? null;
}

export async function createRole(key: string, name: string, description?: string) {
  const [role] = await db.insert(roles).values({ key, name, description: description ?? null }).returning();
  return role;
}

export async function findPermissionsByKeys(keys: string[]) {
  if (keys.length === 0) return [];
  return db.select().from(permissions).where(inArray(permissions.key, keys));
}

export async function listPermissions() {
  return db.select().from(permissions);
}

export async function createPermissions(items: { key: string; name: string; description?: string | null }[]) {
  if (items.length === 0) return [];
  return db.insert(permissions).values(items).returning();
}

export async function attachRoleToUser(userId: string, roleId: number) {
  await db.insert(userRoles).values({ userId, roleId });
}

export async function attachPermissionsToRole(roleId: number, permissionIds: number[]) {
  if (permissionIds.length === 0) return;
  await db.insert(rolePermissions).values(permissionIds.map((permissionId) => ({ roleId, permissionId })));
}

export async function getUserRoleKeys(userId: string) {
  const rows = await db
    .select({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
  return rows.map((row) => row.key as string);
}

export async function getUserPermissions(userId: string) {
  const rows = await db
    .select({ key: permissions.key })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));
  return rows.map((row) => row.key as string);
}
