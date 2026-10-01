import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  image: z.string().url(),
  category_id: z.coerce.number().int().positive(),
  is_special: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();
