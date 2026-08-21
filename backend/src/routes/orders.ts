import { Router } from "express";
import { createOrderController, deleteOrderController, listOrdersController, updateOrderController } from "../controllers/orderController.js";

export const ordersRouter = Router();

ordersRouter.get("/", listOrdersController);
ordersRouter.post("/", createOrderController);
ordersRouter.put("/:id", updateOrderController);
ordersRouter.delete("/:id", deleteOrderController);
