import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  createNewBanner,
  deleteBanner,
  getBanner,
  getBanners,
  getPublicBanners,
  updateBanner,
} from "./banner.service.js";
import { bannerCreateSchema, bannerUpdateSchema } from "./banner.validator.js";

export async function listPublicBannersController(_req: Request, res: Response) {
  try {
    res.json(await getPublicBanners());
  } catch (err) {
    sendError(res, 500, "Failed to load banners", (err as Error).message);
  }
}

export async function listAdminBannersController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  const includeInactive = req.query.includeInactive !== "false";

  try {
    res.json(await getBanners({ page, pageSize, includeInactive }));
  } catch (err) {
    sendError(res, 500, "Failed to load banners", (err as Error).message);
  }
}

export async function getBannerController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid banner ID");

  const banner = await getBanner(id);
  if (!banner) return sendError(res, 404, "Banner not found");
  res.json(banner);
}

export async function createBannerController(req: Request, res: Response) {
  const parsed = bannerCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid banner payload");

  try {
    const created = await createNewBanner(parsed.data);
    res.status(201).json(created);
  } catch (err) {
    sendError(res, 500, "Failed to create banner", (err as Error).message);
  }
}

export async function updateBannerController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid banner ID");

  const parsed = bannerUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid banner payload");

  const updated = await updateBanner(id, parsed.data);
  if (!updated) return sendError(res, 404, "Banner not found");
  res.json(updated);
}

export async function deleteBannerController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid banner ID");

  const deleted = await deleteBanner(id);
  if (!deleted) return sendError(res, 404, "Banner not found");
  res.status(204).send();
}
