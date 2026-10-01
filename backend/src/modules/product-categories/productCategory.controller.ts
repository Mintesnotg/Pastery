import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  createNewCategory,
  deleteCategory,
  getAdminCategories,
  getCategory,
  getPublicCategories,
  updateCategory,
} from "./productCategory.service.js";
import { categoryCreateSchema, categoryUpdateSchema } from "./productCategory.validator.js";

export async function listPublicCategoriesController(_req: Request, res: Response) {
  try {
    res.json(await getPublicCategories());
  } catch (err) {
    sendError(res, 500, "Failed to load categories", (err as Error).message);
  }
}

export async function listAdminCategoriesController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  const includeInactive = req.query.includeInactive !== "false";
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  try {
    res.json(await getAdminCategories({ page, pageSize, includeInactive, search }));
  } catch (err) {
    sendError(res, 500, "Failed to load categories", (err as Error).message);
  }
}

export async function getCategoryController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid category ID");

  const category = await getCategory(id);
  if (!category) return sendError(res, 404, "Category not found");
  res.json(category);
}

export async function createCategoryController(req: Request, res: Response) {
  const parsed = categoryCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid category payload");

  try {
    const created = await createNewCategory(parsed.data, req.auth?.userId);
    res.status(201).json(created);
  } catch (err) {
    sendError(res, 500, "Failed to create category", (err as Error).message);
  }
}

export async function updateCategoryController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid category ID");

  const parsed = categoryUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid category payload");

  const updated = await updateCategory(id, parsed.data, req.auth?.userId);
  if (!updated) return sendError(res, 404, "Category not found");
  res.json(updated);
}

export async function deleteCategoryController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid category ID");

  const deleted = await deleteCategory(id, req.auth?.userId);
  if (!deleted) return sendError(res, 404, "Category not found");
  res.status(204).send();
}
