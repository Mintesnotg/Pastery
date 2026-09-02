import { permissions } from "./permission.schema.js";
import { RecordStatus } from "../../shared/db/enums.js";
import {
  countActivePermissions,
  createPermission,
  deactivatePermissionById,
  findPermissionById,
  findPermissionByKey,
  findPermissionsByRoleIds,
  listPermissions,
  updatePermissionById,
} from "./permission.repository.js";

export async function getPermissions(options: { page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    listPermissions({ limit: pageSize, offset }),
    countActivePermissions(),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
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

export async function getPermissionsByRoleIds(roleIds: number[]) {
  return findPermissionsByRoleIds(roleIds);
}
