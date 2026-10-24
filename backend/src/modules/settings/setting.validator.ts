import { z } from "zod";
import { ORDER_SETTING_KEYS } from "./setting.keys.js";

const cutoffTimeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const settingsUpdateSchema = z
  .object({
    "order.timezone": z.string().min(1).max(64).optional(),
    "order.cutoff_time": z.string().regex(cutoffTimeRegex, "Use HH:mm (24h)").optional(),
    "order.min_lead_days": z
      .union([z.string(), z.number()])
      .transform((v) => String(v))
      .refine((v) => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 0 && n <= 14;
      }, "min_lead_days must be an integer 0–14")
      .optional(),
  })
  .refine((data) => ORDER_SETTING_KEYS.some((key) => data[key] !== undefined), {
    message: "At least one setting key is required",
  });
