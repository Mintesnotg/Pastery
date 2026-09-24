import { listActiveTestimonials } from "./testimonial.repository.js";

export async function getActiveTestimonials() {
  return listActiveTestimonials();
}
