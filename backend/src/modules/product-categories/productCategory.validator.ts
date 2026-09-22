import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();
