import { Router } from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import { createOrderController, deleteOrderController, listOrdersController, updateOrderController } from "../controllers/orderController.js";

export const ordersRouter = Router();

ordersRouter.get("/", requireAuth, requirePermission("orders.read"), listOrdersController);
ordersRouter.post("/", createOrderController);
ordersRouter.put("/:id", requireAuth, requirePermission("orders.write"), updateOrderController);
ordersRouter.delete("/:id", requireAuth, requirePermission("orders.delete"), deleteOrderController);
