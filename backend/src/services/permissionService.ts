import { eq } from "drizzle-orm";
import { permissions, RecordStatus } from "../db/schema.js";
import { createPermission, deactivatePermissionById, findPermissionById, findPermissionByKey, listPermissions, updatePermissionById } from "../repositories/permissionRepository.js";

export async function getPermissions() {
  return listPermissions();
}

export async function getPermission(id: number) {
  return findPermissionById(id);
}

export async function createNewPermission(input: typeof permissions.$inferInsert) {
  const existing = await findPermissionByKey(input.key);
  if (existing) return null;
  return createPermission({ ...input, status: RecordStatus.ACTIVE });
}

export async function updatePermission(id: number, input: Partial<typeof permissions.$inferInsert>) {
  return updatePermissionById(id, input);
}

export async function deletePermission(id: number) {
  return deactivatePermissionById(id);
}
