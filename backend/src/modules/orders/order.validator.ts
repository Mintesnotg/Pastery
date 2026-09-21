import { z } from "zod";

export const itemSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
});

export const orderSchema = z.object({
  customerName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  pickupDate: z.string().min(1),
  pickupTime: z.string().min(1),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(itemSchema).min(1),
  total: z.number().nonnegative(),
});
