import { listActiveTestimonials } from "../repositories/testimonialRepository.js";

export async function getActiveTestimonials() {
  return listActiveTestimonials();
}
