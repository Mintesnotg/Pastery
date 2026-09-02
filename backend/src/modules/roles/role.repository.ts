import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db/index.js";
import { RecordStatus } from "../../shared/db/enums.js";
import { createGenericRepository } from "../../shared/repositories/generic.repository.js";
import { permissions } from "../permissions/permission.schema.js";
import { rolePermissions, roles } from "./role.schema.js";

const roleRepository = createGenericRepository(roles, roles.id);

export function listRoles() {
  return roleRepository.findMany({ where: eq(roles.status, RecordStatus.ACTIVE), orderBy: desc(roles.createdAt) });
}

export function listRolesPaginated(options: { limit?: number; offset?: number } = {}) {
  return roleRepository.findMany({
    where: eq(roles.status, RecordStatus.ACTIVE),
    orderBy: desc(roles.createdAt),
    ...options,
  });
}

export function countActiveRoles() {
  return roleRepository.count(eq(roles.status, RecordStatus.ACTIVE));
}

export function findRoleById(id: number) {
  return roleRepository.findById(id);
}

export function findRoleByKey(key: string) {
  return roleRepository.findOne(eq(roles.key, key));
}

export function createRole(data: typeof roles.$inferInsert) {
  return roleRepository.create(data);
}

export function updateRoleById(id: number, data: Partial<typeof roles.$inferInsert>) {
  return roleRepository.updateById(id, data);
}

export function deactivateRoleById(id: number) {
  return roleRepository.updateById(id, { status: RecordStatus.INACTIVE } as Partial<typeof roles.$inferInsert>);
}

export async function findRoleWithPermissionsById(id: number) {
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!role) return null;
  const assignedPermissions = await db
    .select({
      id: permissions.id,
      key: permissions.key,
      name: permissions.name,
      description: permissions.description,
      status: permissions.status,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(rolePermissions.roleId, id), eq(permissions.status, RecordStatus.ACTIVE)));
  return { ...role, permissions: assignedPermissions };
}

export async function replaceRolePermissions(roleId: number, permissionIds: number[]) {
  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length === 0) return;
    await tx.insert(rolePermissions).values(uniquePermissionIds.map((permissionId) => ({ roleId, permissionId })));
  });
}

export async function createRoleWithPermissions(data: typeof roles.$inferInsert, permissionIds: number[] = []) {
  return db.transaction(async (tx) => {
    const [created] = await tx.insert(roles).values(data).returning();
    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length > 0) {
      await tx.insert(rolePermissions).values(uniquePermissionIds.map((permissionId) => ({ roleId: created.id, permissionId })));
    }
    return created;
  });
}

export async function updateRoleWithPermissions(
  id: number,
  data: Partial<typeof roles.$inferInsert>,
  permissionIds?: number[]
) {
  return db.transaction(async (tx) => {
    const [updated] = await tx.update(roles).set(data).where(eq(roles.id, id)).returning();
    if (!updated) return null;
    if (permissionIds) {
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
      const uniquePermissionIds = [...new Set(permissionIds)];
      if (uniquePermissionIds.length > 0) {
        await tx.insert(rolePermissions).values(uniquePermissionIds.map((permissionId) => ({ roleId: id, permissionId })));
      }
    }
    return updated;
  });
}

export async function listPermissionsForSelection() {
  return db.select().from(permissions).where(eq(permissions.status, RecordStatus.ACTIVE)).orderBy(desc(permissions.createdAt));
}

export async function findActivePermissionsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select({ id: permissions.id })
    .from(permissions)
    .where(and(inArray(permissions.id, ids), eq(permissions.status, RecordStatus.ACTIVE)));
}

export async function findRolesByIds(roleIds: number[]) {
  if (roleIds.length === 0) return [];
  return db.select().from(roles).where(inArray(roles.id, roleIds));
}
