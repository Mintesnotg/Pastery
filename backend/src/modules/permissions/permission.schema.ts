import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { recordStatusEnum } from "../../shared/db/enums.js";

export const permissions = pgTable(
  "permissions",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: recordStatusEnum("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    keyIdx: uniqueIndex("permissions_key_unique").on(t.key),
  })
);

export type Permission = typeof permissions.$inferSelect;
