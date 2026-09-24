import type { Banner, Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

export function listActiveBanners() {
  return prisma.banner.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export function listBanners(options: { limit?: number; offset?: number; includeInactive?: boolean } = {}) {
  return prisma.banner.findMany({
    where: options.includeInactive ? undefined : { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: options.limit,
    skip: options.offset,
  });
}

export function countBanners(includeInactive = false) {
  return prisma.banner.count({
    where: includeInactive ? undefined : { active: true },
  });
}

export function findBannerById(id: number) {
  return prisma.banner.findUnique({ where: { id } });
}

export function createBanner(data: Prisma.BannerCreateInput) {
  return prisma.banner.create({ data });
}

export function updateBannerById(id: number, data: Prisma.BannerUpdateInput) {
  return prisma.banner.update({ where: { id }, data }).catch(() => null);
}

export function deactivateBannerById(id: number) {
  return updateBannerById(id, { active: false });
}

export type { Banner };
