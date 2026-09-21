import {
  countBanners,
  createBanner,
  deactivateBannerById,
  findBannerById,
  listActiveBanners,
  listBanners,
  updateBannerById,
} from "./banner.repository.js";
import {
  toBannerAdminDto,
  toBannerCreateInput,
  toBannerPublicDto,
  toBannerUpdateInput,
  type BannerWriteInput,
} from "./banner.mapper.js";

export async function getPublicBanners() {
  const rows = await listActiveBanners();
  return rows.map(toBannerPublicDto);
}

export async function getBanners(options: {
  page?: number;
  pageSize?: number;
  includeInactive?: boolean;
} = {}) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 20));
  const offset = (page - 1) * pageSize;
  const includeInactive = options.includeInactive ?? true;

  const [rows, total] = await Promise.all([
    listBanners({ limit: pageSize, offset, includeInactive }),
    countBanners(includeInactive),
  ]);

  return {
    data: rows.map(toBannerAdminDto),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getBanner(id: number) {
  const banner = await findBannerById(id);
  return banner ? toBannerAdminDto(banner) : null;
}

export async function createNewBanner(input: BannerWriteInput) {
  const created = await createBanner(toBannerCreateInput(input));
  return toBannerAdminDto(created);
}

export async function updateBanner(id: number, input: Partial<BannerWriteInput>) {
  const updated = await updateBannerById(id, toBannerUpdateInput(input));
  return updated ? toBannerAdminDto(updated) : null;
}

export async function deleteBanner(id: number) {
  const deleted = await deactivateBannerById(id);
  return deleted ? toBannerAdminDto(deleted) : null;
}
