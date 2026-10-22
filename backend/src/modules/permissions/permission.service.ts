import type { Prisma } from "@prisma/client";
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

export async function createNewPermission(input: Prisma.PermissionCreateInput) {
  const existing = await findPermissionByKey(input.key);
  if (existing) return null;
  const created = await createPermission({ ...input, status: RecordStatus.ACTIVE });
  invalidatePermissionCache();
  return created;
}

export async function updatePermission(id: number, input: Prisma.PermissionUpdateInput) {
  const updated = await updatePermissionById(id, input);
  invalidatePermissionCache();
  return updated;
}

export async function deletePermission(id: number) {
  const deleted = await deactivatePermissionById(id);
  invalidatePermissionCache();
  return deleted;
}

// Permissions are resolved on every authenticated request. A short, bounded,
// in-process cache avoids one DB round-trip per request; it is cleared whenever
// roles or permissions change in this process.
const PERMISSION_CACHE_TTL_MS = 60_000;
const PERMISSION_CACHE_MAX_ENTRIES = 500;
const permissionCache = new Map<string, { permissions: string[]; expiresAt: number }>();

export function invalidatePermissionCache() {
  permissionCache.clear();
}

export async function getPermissionsByRoleIds(roleIds: number[]) {
  const key = [...new Set(roleIds)].sort((a, b) => a - b).join(",");
  if (!key) return [];

  const now = Date.now();
  const cached = permissionCache.get(key);
  if (cached && cached.expiresAt > now) return [...cached.permissions];

  const permissions = await findPermissionsByRoleIds(roleIds);
  if (permissionCache.size >= PERMISSION_CACHE_MAX_ENTRIES) permissionCache.clear();
  permissionCache.set(key, { permissions, expiresAt: now + PERMISSION_CACHE_TTL_MS });
  return [...permissions];
}
