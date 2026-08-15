import { desc, eq } from "drizzle-orm";
import { permissions, RecordStatus } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const permissionRepository = createGenericRepository(permissions, permissions.id);

export function listPermissions() {
  return permissionRepository.findMany({ where: eq(permissions.status, RecordStatus.ACTIVE), orderBy: desc(permissions.createdAt) });
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
