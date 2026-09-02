import { eq } from "drizzle-orm";
import { createGenericRepository } from "../../shared/repositories/generic.repository.js";
import { testimonials } from "./testimonial.schema.js";

const testimonialRepository = createGenericRepository(testimonials, testimonials.id);

export async function listActiveTestimonials() {
  return testimonialRepository.findMany({ where: eq(testimonials.active, true) });
}

export const findTestimonialById = testimonialRepository.findById;
export const createTestimonial = testimonialRepository.create;
export const updateTestimonialById = testimonialRepository.updateById;
export const deleteTestimonialById = testimonialRepository.deleteById;
