import { Router } from "express";
import { listProductsController } from "../controllers/productController.js";

export const productsRouter = Router();

productsRouter.get("/", listProductsController);
