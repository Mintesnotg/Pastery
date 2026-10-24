import { z } from "zod";

export const itemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  qty: z.number().int().positive(),
});

export const orderSchema = z
  .object({
    customerName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().or(z.literal("")),
    pickupDate: z.string().min(1),
    pickupTime: z.string().min(1),
    notes: z.string().optional().or(z.literal("")),
    items: z.array(itemSchema).min(1),
    total: z.number().nonnegative().optional(),
    channel: z.enum(["retail", "wholesale"]).optional().default("retail"),
    fulfillmentType: z.enum(["pickup", "delivery"]).optional().default("pickup"),
    deliveryAddress: z.string().max(2000).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.fulfillmentType === "delivery") {
        return Boolean(data.deliveryAddress?.trim());
      }
      return true;
    },
    { message: "deliveryAddress is required for delivery", path: ["deliveryAddress"] },
  );

export const markPaidSchema = z.object({
  payment_reference: z.string().max(191).optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]),
  deliveryNote: z
    .object({
      signerName: z.string().trim().min(1).max(191),
      medium: z.enum(["paper", "digital"]),
    })
    .optional()
    .nullable(),
});
