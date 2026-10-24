import { z } from "zod";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

export const processCollectionsSchema = z.object({
  date: ymd.optional(),
});

export const resolveCollectionTaskSchema = z.object({
  notes: z.string().max(2000).optional().nullable(),
});

export const downgradeAccountSchema = z.object({
  business_account_id: z.number().int().positive(),
  notes: z.string().max(2000).optional().nullable(),
  force: z.boolean().optional().default(false),
});
