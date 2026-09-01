import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { permissions, RecordStatus, rolePermissions } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const permissionRepository = createGenericRepository(permissions, permissions.id);

export function listPermissions(options: { limit?: number; offset?: number } = {}) {
  return permissionRepository.findMany({
    where: eq(permissions.status, RecordStatus.ACTIVE),
    orderBy: desc(permissions.createdAt),
    ...options,
  });
}

export function countActivePermissions() {
  return permissionRepository.count(eq(permissions.status, RecordStatus.ACTIVE));
}

export function findPermissionById(id: number) {
  return permissionRepository.findById(id);
}

export function findPermissionByKey(key: string) {
  return permissionRepository.findOne(eq(permissions.key, key));
}

export function createPermission(data: typeof permissions.$inferInsert) {
  return permissionRepository.create(data);
}

export function updatePermissionById(id: number, data: Partial<typeof permissions.$inferInsert>) {
  return permissionRepository.updateById(id, data);
}

export function deactivatePermissionById(id: number) {
  return permissionRepository.updateById(id, { status: RecordStatus.INACTIVE } as Partial<typeof permissions.$inferInsert>);
}

export async function findPermissionsByRoleIds(roleIds: number[]) {
  const uniqueRoleIds = [...new Set(roleIds)];
  if (uniqueRoleIds.length === 0) return [];

  const rows = await db
    .selectDistinct({ key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(inArray(rolePermissions.roleId, uniqueRoleIds));

  return rows
    .filter((row) => row.key !== null)
    .map((row) => row.key)
    .filter((key): key is string => typeof key === "string");
}
