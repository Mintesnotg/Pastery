import { Router } from "express";
import { listTestimonialsController } from "./testimonial.controller.js";

export const testimonialsRouter = Router();

testimonialsRouter.get("/", listTestimonialsController);
