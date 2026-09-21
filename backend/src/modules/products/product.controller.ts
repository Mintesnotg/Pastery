import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { getProducts } from "./product.service.js";

export async function listProductsController(_req: Request, res: Response) {
  try {
    const rows = await getProducts();
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to load products", (err as Error).message);
  }
}
