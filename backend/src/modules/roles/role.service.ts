import { roles } from "./role.schema.js";
import { RecordStatus } from "../../shared/db/enums.js";
import {
  countActiveRoles,
  createRoleWithPermissions,
  deactivateRoleById,
  findActivePermissionsByIds,
  findRoleById,
  findRoleByKey,
  findRoleWithPermissionsById,
  listPermissionsForSelection,
  listRoles,
  listRolesPaginated,
  updateRoleWithPermissions,
} from "./role.repository.js";

export async function getRoles() {
  return listRoles();
}

export async function getRolesPaginated(options: { page?: number; pageSize?: number } = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    listRolesPaginated({ limit: pageSize, offset }),
    countActiveRoles(),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
}

export async function getRole(id: number) {
  return findRoleById(id);
}

export async function getRoleWithPermissions(id: number) {
  return findRoleWithPermissionsById(id);
}

export async function getRolePermissionOptions() {
  return listPermissionsForSelection();
}

async function checkPermissionIdsExist(ids: number[]): Promise<boolean> {
  const unique = [...new Set(ids)];
  const found = await findActivePermissionsByIds(unique);
  return found.length === unique.length;
}

export async function createNewRole(input: typeof roles.$inferInsert & { permissionIds?: number[] }) {
  const existing = await findRoleByKey(input.key);
  if (existing) return null;
  const { permissionIds = [], ...roleData } = input;
  if (!(await checkPermissionIdsExist(permissionIds))) return { invalidPermissionIds: true as const };
  return createRoleWithPermissions({ ...roleData, status: RecordStatus.ACTIVE }, permissionIds);
}

export async function updateRole(id: number, input: Partial<typeof roles.$inferInsert> & { permissionIds?: number[] }) {
  const { permissionIds, ...roleData } = input;
  if (permissionIds !== undefined && !(await checkPermissionIdsExist(permissionIds))) {
    return { invalidPermissionIds: true as const };
  }
  return updateRoleWithPermissions(id, roleData, permissionIds);
}

export async function deleteRole(id: number) {
  return deactivateRoleById(id);
}
