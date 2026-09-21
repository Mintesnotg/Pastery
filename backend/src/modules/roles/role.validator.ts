import { z } from "zod";

export const roleSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  permissionIds: z.array(z.number().int().positive()).min(1),
});

export const roleUpdateSchema = roleSchema.partial();
