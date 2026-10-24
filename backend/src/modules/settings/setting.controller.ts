import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { getAdminSettings, getPublicSettings, updateSettings } from "./setting.service.js";
import { settingsUpdateSchema } from "./setting.validator.js";

export async function getPublicSettingsController(_req: Request, res: Response) {
  try {
    res.json(await getPublicSettings());
  } catch (err) {
    sendError(res, 500, "Failed to load settings", (err as Error).message);
  }
}

export async function getAdminSettingsController(_req: Request, res: Response) {
  try {
    res.json(await getAdminSettings());
  } catch (err) {
    sendError(res, 500, "Failed to load settings", (err as Error).message);
  }
}

export async function updateSettingsController(req: Request, res: Response) {
  const parsed = settingsUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return sendError(res, 400, "Invalid settings payload", parsed.error.flatten());
  }

  try {
    res.json(await updateSettings(parsed.data));
  } catch (err) {
    sendError(res, 500, "Failed to update settings", (err as Error).message);
  }
}
