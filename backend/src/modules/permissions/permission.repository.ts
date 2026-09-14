import type { Prisma, Permission } from "@prisma/client";
import { prisma } from "../../db/index.js";
import { RecordStatus } from "../../shared/db/enums.js";

export function listPermissions(options: { limit?: number; offset?: number } = {}) {
  return prisma.permission.findMany({
    where: { status: RecordStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
    take: options.limit,
    skip: options.offset,
  });
}

export function countActivePermissions() {
  return prisma.permission.count({ where: { status: RecordStatus.ACTIVE } });
}

export function findPermissionById(id: number) {
  return prisma.permission.findUnique({ where: { id } });
}

export function findPermissionByKey(key: string) {
  return prisma.permission.findFirst({ where: { key } });
}

export function createPermission(data: Prisma.PermissionCreateInput) {
  return prisma.permission.create({ data });
}

export function updatePermissionById(id: number, data: Prisma.PermissionUpdateInput) {
  return prisma.permission.update({ where: { id }, data }).catch(() => null);
}

export function deactivatePermissionById(id: number) {
  return updatePermissionById(id, { status: RecordStatus.INACTIVE });
}

export async function findPermissionsByRoleIds(roleIds: number[]) {
  const uniqueRoleIds = [...new Set(roleIds)];
  if (uniqueRoleIds.length === 0) return [];

  const rows = await prisma.rolePermission.findMany({
    where: { roleId: { in: uniqueRoleIds } },
    select: { permission: { select: { key: true } } },
    distinct: ["permissionId"],
  });

  return [...new Set(rows.map((row) => row.permission.key))];
}

export type { Permission };
