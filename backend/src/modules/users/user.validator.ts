import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^a-zA-Z\d]/, "Password must contain at least one special character"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roleIds: z.array(z.number().int().positive()).optional(),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  roleIds: z.array(z.number().int().positive()).optional(),
});
