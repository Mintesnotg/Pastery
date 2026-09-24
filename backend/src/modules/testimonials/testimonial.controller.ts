import type { Request, Response } from "express";
import { sendError } from "../../shared/utils/response.js";
import { getActiveTestimonials } from "./testimonial.service.js";

export async function listTestimonialsController(_req: Request, res: Response) {
  try {
    const rows = await getActiveTestimonials();
    res.json(rows);
  } catch (err) {
    sendError(res, 500, "Failed to load testimonials", (err as Error).message);
  }
}
