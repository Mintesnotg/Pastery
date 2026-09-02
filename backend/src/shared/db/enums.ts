import { pgEnum } from "drizzle-orm/pg-core";

export const recordStatusEnum = pgEnum("record_status", ["ACTIVE", "INACTIVE"]);
export const RecordStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type RecordStatus = (typeof RecordStatus)[keyof typeof RecordStatus];

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded",
  "cancelled",
]);
