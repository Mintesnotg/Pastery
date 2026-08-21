import type { Request, Response } from "express";
import { getProducts } from "../services/productService.js";
import { sendError } from "../utils/response.js";

export async function listProductsController(_req: Request, res: Response) {
  try {
    const rows = await getProducts();
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to load products", (err as Error).message);
  }
}
