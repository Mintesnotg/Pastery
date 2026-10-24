import { z } from "zod";

export const businessAccountRegisterSchema = z.object({
  business_name: z.string().min(1).max(191),
  address_line1: z.string().min(1).max(191),
  address_line2: z.string().max(191).optional().nullable(),
  city: z.string().min(1).max(191),
  postcode: z.string().min(1).max(32),
  country: z.string().min(2).max(2).default("GB"),
  phone: z.string().max(64).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const businessAccountAdminUpdateSchema = z
  .object({
    approval_status: z.enum(["pending", "approved", "rejected"]).optional(),
    rejection_reason: z.string().max(2000).optional().nullable(),
    credit_tier: z.coerce.number().int().min(0).max(2).optional(),
    credit_limit: z.coerce.number().nonnegative().optional(),
    overdue_paused: z.boolean().optional(),
    notes: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.approval_status === "rejected") {
        return Boolean(data.rejection_reason?.trim());
      }
      return true;
    },
    { message: "rejection_reason is required when rejecting", path: ["rejection_reason"] },
  )
  .refine(
    (data) => {
      if (data.approval_status === "approved") {
        return data.credit_tier !== undefined;
      }
      return true;
    },
    { message: "credit_tier is required when approving", path: ["credit_tier"] },
  );
