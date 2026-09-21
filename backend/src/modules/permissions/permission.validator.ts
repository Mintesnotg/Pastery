import { z } from "zod";

export const permissionSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export const permissionUpdateSchema = permissionSchema.partial();
