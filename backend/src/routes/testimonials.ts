import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { testimonials } from "../db/schema.js";
import { sendError } from "../utils/response.js";

export const testimonialsRouter = Router();

testimonialsRouter.get("/", async (_req, res) => {
  try {
    const rows = await db.select().from(testimonials).where(eq(testimonials.active, true));
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to load testimonials", (err as Error).message);
  }
});
