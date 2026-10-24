import { z } from "zod";

const weekdaySchema = z.number().int().min(1).max(7);

export const standingItemSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export const createStandingOrderSchema = z
  .object({
    weekdays: z.array(weekdaySchema).min(1),
    fulfillment_type: z.enum(["pickup", "delivery"]).default("pickup"),
    delivery_address: z.string().max(2000).optional().nullable(),
    preferred_time: z.string().min(1).max(16),
    notes: z.string().max(2000).optional().nullable(),
    items: z.array(standingItemSchema).min(1),
  })
  .refine(
    (data) => {
      if (data.fulfillment_type === "delivery") {
        return Boolean(data.delivery_address?.trim());
      }
      return true;
    },
    { message: "delivery_address is required for delivery", path: ["delivery_address"] },
  );

export const updateStandingOrderSchema = z
  .object({
    weekdays: z.array(weekdaySchema).min(1).optional(),
    fulfillment_type: z.enum(["pickup", "delivery"]).optional(),
    delivery_address: z.string().max(2000).optional().nullable(),
    preferred_time: z.string().min(1).max(16).optional(),
    notes: z.string().max(2000).optional().nullable(),
    active: z.boolean().optional(),
    items: z.array(standingItemSchema).min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.fulfillment_type === "delivery") {
        return Boolean(data.delivery_address?.trim());
      }
      return true;
    },
    { message: "delivery_address is required for delivery", path: ["delivery_address"] },
  );

export const generateStandingOrdersSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
