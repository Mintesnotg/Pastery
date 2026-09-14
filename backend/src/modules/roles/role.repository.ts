import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../../db/index.js";
import { RecordStatus } from "../../shared/db/enums.js";

export function listRoles() {
  return prisma.role.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
  });
}

export function listRolesPaginated(options: { limit?: number; offset?: number } = {}) {
  return prisma.role.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
    take: options.limit,
    skip: options.offset,
  });
}

export function countActiveRoles() {
  return prisma.role.count({ where: { status: RecordStatus.ACTIVE } });
}

export function findRoleById(id: number) {
  return prisma.role.findUnique({ where: { id } });
}

export function findRoleByKey(key: string) {
  return prisma.role.findFirst({ where: { key } });
}

export function createRole(data: Prisma.RoleCreateInput) {
  return prisma.role.create({ data });
}

export function updateRoleById(id: number, data: Prisma.RoleUpdateInput) {
  return prisma.role.update({ where: { id }, data }).catch(() => null);
}

export function deactivateRoleById(id: number) {
  return updateRoleById(id, { status: RecordStatus.INACTIVE });
}

export async function findRoleWithPermissionsById(id: number) {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        where: { permission: { status: RecordStatus.ACTIVE } },
        include: {
          permission: {
            select: { id: true, key: true, name: true, description: true, status: true },
          },
        },
      },
    },
  });
  if (!role) return null;
  const { rolePermissions, ...rest } = role;
  return {
    ...rest,
    permissions: rolePermissions.map((rp) => rp.permission),
  };
}

export async function replaceRolePermissions(roleId: number, permissionIds: number[]) {
  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId } });
    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length === 0) return;
    await tx.rolePermission.createMany({
      data: uniquePermissionIds.map((permissionId) => ({ roleId, permissionId })),
    });
  });
}

export async function createRoleWithPermissions(
  data: Prisma.RoleCreateInput,
  permissionIds: number[] = [],
) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.role.create({ data });
    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: uniquePermissionIds.map((permissionId) => ({
          roleId: created.id,
          permissionId,
        })),
      });
    }
    return created;
  });
}

export async function updateRoleWithPermissions(
  id: number,
  data: Prisma.RoleUpdateInput,
  permissionIds?: number[],
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.role.update({ where: { id }, data }).catch(() => null);
    if (!updated) return null;
    if (permissionIds) {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      const uniquePermissionIds = [...new Set(permissionIds)];
      if (uniquePermissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: uniquePermissionIds.map((permissionId) => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }
    return updated;
  });
}

export async function listPermissionsForSelection() {
  return prisma.permission.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
  });
}

export async function findActivePermissionsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return prisma.permission.findMany({
    where: { id: { in: ids }, status: RecordStatus.ACTIVE },
    select: { id: true },
  });
}

export async function findRolesByIds(roleIds: number[]) {
  if (roleIds.length === 0) return [];
  return prisma.role.findMany({ where: { id: { in: roleIds } } });
}

export type { Role };
