import { eq } from "drizzle-orm";
import { testimonials } from "../db/schema.js";
import { createGenericRepository } from "./genericRepository.js";

const testimonialRepository = createGenericRepository(testimonials, testimonials.id);

export async function listActiveTestimonials() {
  return testimonialRepository.findMany({ where: eq(testimonials.active, true) });
}

export const findTestimonialById = testimonialRepository.findById;
export const createTestimonial = testimonialRepository.create;
export const updateTestimonialById = testimonialRepository.updateById;
export const deleteTestimonialById = testimonialRepository.deleteById;
