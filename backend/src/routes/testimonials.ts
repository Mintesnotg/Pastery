import { Router } from "express";
import { listTestimonialsController } from "../controllers/testimonialController.js";

export const testimonialsRouter = Router();

testimonialsRouter.get("/", listTestimonialsController);
