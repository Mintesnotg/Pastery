import { z } from "zod";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const generateInvoicesSchema = z.object({
  week_start: ymd.optional(),
  business_account_id: z.number().int().positive().optional(),
});

export const recordInvoicePaymentSchema = z.object({
  amount: z.number().positive(),
  reference: z.string().max(191).optional().nullable(),
  method: z.enum(["bank_transfer", "cash", "mobile"]),
});
