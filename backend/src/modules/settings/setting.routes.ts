import { Router } from "express";
import {
  getAdminSettingsController,
  getPublicSettingsController,
  updateSettingsController,
} from "./setting.controller.js";

export const settingsRouter = Router();

settingsRouter.get("/public", getPublicSettingsController);
settingsRouter.get("/", getAdminSettingsController);
settingsRouter.put("/", updateSettingsController);
