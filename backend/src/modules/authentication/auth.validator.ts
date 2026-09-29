import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});
