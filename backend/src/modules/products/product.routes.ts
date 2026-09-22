import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getProductController,
  listAdminProductsController,
  listPublicProductsController,
  updateProductController,
} from "./product.controller.js";

export const productsRouter = Router();

productsRouter.get("/", listPublicProductsController);
productsRouter.get("/admin", listAdminProductsController);
productsRouter.post("/", createProductController);
productsRouter.get("/:id", getProductController);
productsRouter.put("/:id", updateProductController);
productsRouter.delete("/:id", deleteProductController);
