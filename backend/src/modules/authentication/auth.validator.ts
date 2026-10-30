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
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[^a-zA-Z\d]/, "Password must contain at least one special character"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

/** @deprecated OTP flow removed — kept so old clients get a clear error. */
export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "Code must be exactly 6 digits"),
});
