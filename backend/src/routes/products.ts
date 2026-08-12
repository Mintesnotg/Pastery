import { Router } from "express";
import { desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { sendError } from "../utils/response.js";

export const productsRouter = Router();

productsRouter.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(products).orderBy(desc(products.createdAt));
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to load products", (err as Error).message);
  }
});
