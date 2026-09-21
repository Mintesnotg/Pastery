import { Router } from "express";
import {
  createBannerController,
  deleteBannerController,
  getBannerController,
  listAdminBannersController,
  listPublicBannersController,
  updateBannerController,
} from "./banner.controller.js";

export const bannersRouter = Router();

bannersRouter.get("/", listPublicBannersController);
bannersRouter.get("/admin", listAdminBannersController);
bannersRouter.post("/", createBannerController);
bannersRouter.get("/:id", getBannerController);
bannersRouter.put("/:id", updateBannerController);
bannersRouter.delete("/:id", deleteBannerController);
