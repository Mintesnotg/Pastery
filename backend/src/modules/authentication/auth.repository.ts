import { prisma } from "../../db/index.js";

export async function findRoleByKey(key: string) {
  return prisma.role.findFirst({ where: { key } });
}

export async function createRole(key: string, name: string, description?: string) {
  return prisma.role.create({
    data: { key, name, description: description ?? null },
  });
}

export async function findPermissionsByKeys(keys: string[]) {
  if (keys.length === 0) return [];
  return prisma.permission.findMany({ where: { key: { in: keys } } });
}

export async function listPermissions() {
  return prisma.permission.findMany();
}

export async function createPermissions(items: { key: string; name: string; description?: string | null }[]) {
  if (items.length === 0) return [];
  await prisma.permission.createMany({ data: items });
  return prisma.permission.findMany({
    where: { key: { in: items.map((i) => i.key) } },
  });
}

export async function attachRoleToUser(userId: string, roleId: number) {
  await prisma.userRole.create({ data: { userId, roleId } });
}

export async function attachPermissionsToRole(roleId: number, permissionIds: number[]) {
  if (permissionIds.length === 0) return;
  await prisma.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
  });
}

export async function getUserRoleKeys(userId: string) {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    select: { role: { select: { key: true } } },
  });
  return rows.map((row) => row.role.key);
}

export async function getUserRoleIds(userId: string) {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    select: { role: { select: { id: true } } },
  });
  return rows.map((row) => row.role.id);
}

export async function getUserPermissions(userId: string) {
  const rows = await prisma.userRole.findMany({
    where: { userId },
    select: {
      role: {
        select: {
          rolePermissions: {
            select: { permission: { select: { key: true } } },
          },
        },
      },
    },
  });
  return [
    ...new Set(
      rows.flatMap((row) => row.role.rolePermissions.map((rp) => rp.permission.key)),
    ),
  ];
}
