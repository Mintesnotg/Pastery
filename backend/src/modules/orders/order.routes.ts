import { Router } from "express";
import {
  createOrderController,
  deleteOrderController,
  getOrderController,
  listOrdersController,
  markPaidController,
  updateOrderController,
} from "./order.controller.js";

export const ordersRouter = Router();

ordersRouter.get("/", listOrdersController);
ordersRouter.get("/:id", getOrderController);
ordersRouter.post("/", createOrderController);
ordersRouter.post("/:id/mark-paid", markPaidController);
ordersRouter.put("/:id", updateOrderController);
ordersRouter.delete("/:id", deleteOrderController);
