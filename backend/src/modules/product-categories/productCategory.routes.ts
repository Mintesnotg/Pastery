import { Router } from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getCategoryController,
  listAdminCategoriesController,
  listPublicCategoriesController,
  updateCategoryController,
} from "./productCategory.controller.js";

export const productCategoriesRouter = Router();

productCategoriesRouter.get("/", listPublicCategoriesController);
productCategoriesRouter.get("/admin", listAdminCategoriesController);
productCategoriesRouter.post("/", createCategoryController);
productCategoriesRouter.get("/:id", getCategoryController);
productCategoriesRouter.put("/:id", updateCategoryController);
productCategoriesRouter.delete("/:id", deleteCategoryController);
