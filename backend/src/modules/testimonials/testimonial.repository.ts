import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/index.js";

export async function listActiveTestimonials() {
  return prisma.testimonial.findMany({ where: { active: true } });
}

export const findTestimonialById = (id: number) => prisma.testimonial.findUnique({ where: { id } });
export const createTestimonial = (data: Prisma.TestimonialCreateInput) =>
  prisma.testimonial.create({ data });
export const updateTestimonialById = (id: number, data: Prisma.TestimonialUpdateInput) =>
  prisma.testimonial.update({ where: { id }, data }).catch(() => null);
export const deleteTestimonialById = (id: number) =>
  prisma.testimonial.delete({ where: { id } }).catch(() => null);
