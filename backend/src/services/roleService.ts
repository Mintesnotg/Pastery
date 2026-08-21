import { roles, RecordStatus } from "../db/schema.js";
import { createRoleWithPermissions, deactivateRoleById, findRoleById, findRoleByKey, findRoleWithPermissionsById, listPermissionsForSelection, listRoles, updateRoleWithPermissions } from "../repositories/roleRepository.js";

export async function getRoles() {
  return listRoles();
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

export async function createNewRole(input: typeof roles.$inferInsert & { permissionIds?: number[] }) {
  const existing = await findRoleByKey(input.key);
  if (existing) return null;
  const { permissionIds = [], ...roleData } = input;
  return createRoleWithPermissions({ ...roleData, status: RecordStatus.ACTIVE }, permissionIds);
}

export async function updateRole(id: number, input: Partial<typeof roles.$inferInsert> & { permissionIds?: number[] }) {
  const { permissionIds, ...roleData } = input;
  return updateRoleWithPermissions(id, roleData, permissionIds);
}

export async function deleteRole(id: number) {
  return deactivateRoleById(id);
}
