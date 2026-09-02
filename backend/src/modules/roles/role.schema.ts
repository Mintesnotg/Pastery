import { pgTable, serial, text, integer, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { recordStatusEnum } from "../../shared/db/enums.js";
import { users } from "../users/user.schema.js";
import { permissions } from "../permissions/permission.schema.js";

export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: recordStatusEnum("status").default("ACTIVE").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    keyIdx: uniqueIndex("roles_key_unique").on(t.key),
  })
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: uniqueIndex("user_roles_user_role_unique").on(t.userId, t.roleId),
  })
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: uniqueIndex("role_permissions_role_permission_unique").on(t.roleId, t.permissionId),
  })
);

export type Role = typeof roles.$inferSelect;
