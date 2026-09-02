import { Router } from "express";
import { listProductsController } from "./product.controller.js";

export const productsRouter = Router();

productsRouter.get("/", listProductsController);
