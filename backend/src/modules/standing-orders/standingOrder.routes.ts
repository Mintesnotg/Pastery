import { Router } from "express";
import {
  createStandingOrderController,
  deleteStandingOrderController,
  generateStandingOrdersController,
  listStandingOrdersController,
  updateStandingOrderController,
} from "./standingOrder.controller.js";

export const standingOrdersRouter = Router();

standingOrdersRouter.get("/", listStandingOrdersController);
standingOrdersRouter.post("/", createStandingOrderController);
standingOrdersRouter.post("/generate", generateStandingOrdersController);
standingOrdersRouter.put("/:id", updateStandingOrderController);
standingOrdersRouter.delete("/:id", deleteStandingOrderController);
