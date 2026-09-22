import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { readNumericId } from "../../shared/utils/requestParams.js";
import {
  createNewProduct,
  deleteProduct,
  getAdminProducts,
  getProduct,
  getPublicProducts,
  updateProduct,
} from "./product.service.js";
import { productCreateSchema, productUpdateSchema } from "./product.validator.js";

export async function listPublicProductsController(req: Request, res: Response) {
  try {
    res.json(
      await getPublicProducts({
        isSpecial: req.query.isSpecial,
        categoryId: req.query.categoryId,
        category: req.query.category,
      }),
    );
  } catch (err) {
    sendError(res, 500, "Failed to load products", (err as Error).message);
  }
}

export async function listAdminProductsController(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.max(1, Math.min(100, Number(req.query.pageSize) || 20));
  const includeInactive = req.query.includeInactive !== "false";
  const search = typeof req.query.search === "string" ? req.query.search : undefined;

  try {
    res.json(await getAdminProducts({ page, pageSize, includeInactive, search }));
  } catch (err) {
    sendError(res, 500, "Failed to load products", (err as Error).message);
  }
}

export async function getProductController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid product ID");

  const product = await getProduct(id);
  if (!product) return sendError(res, 404, "Product not found");
  res.json(product);
}

export async function createProductController(req: Request, res: Response) {
  const parsed = productCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid product payload");

  try {
    const created = await createNewProduct(parsed.data, req.auth?.userId);
    res.status(201).json(created);
  } catch (err) {
    sendError(res, 500, "Failed to create product", (err as Error).message);
  }
}

export async function updateProductController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid product ID");

  const parsed = productUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid product payload");

  const updated = await updateProduct(id, parsed.data, req.auth?.userId);
  if (!updated) return sendError(res, 404, "Product not found");
  res.json(updated);
}

export async function deleteProductController(req: Request, res: Response) {
  const id = readNumericId(req.params.id);
  if (!id) return sendError(res, 400, "Invalid product ID");

  const deleted = await deleteProduct(id, req.auth?.userId);
  if (!deleted) return sendError(res, 404, "Product not found");
  res.status(204).send();
}
