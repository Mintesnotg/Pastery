import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { permissions, roles, rolePermissions, userRoles, users } from "../db/schema.js";
import { hashPassword, signSession, verifyPassword } from "../lib/auth.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function ensureBootstrapAdmin() {
  const existing = await db.select().from(users).where(eq(users.email, env.bootstrapEmail)).limit(1);
  if (existing.length > 0) return;
  const { salt, hash } = hashPassword(env.bootstrapPassword);
  const [admin] = await db.insert(users).values({
    email: env.bootstrapEmail,
    passwordHash: hash,
    passwordSalt: salt,
    fullName: "Bootstrap Admin",
  }).returning();
  const [adminRole] = await db.insert(roles).values({ key: "admin", name: "Administrator" }).returning();
  const perms = [
    ["orders.read", "Read orders"],
    ["orders.write", "Update orders"],
    ["orders.delete", "Delete orders"],
    ["messages.read", "Read messages"],
    ["messages.delete", "Delete messages"],
    ["users.manage", "Manage users"],
  ];
  const insertedPerms = await Promise.all(perms.map(([key, name]) => db.insert(permissions).values({ key, name }).returning()));
  await db.insert(userRoles).values({ userId: admin.id, roleId: adminRole.id });
  await db.insert(rolePermissions).values(insertedPerms.flat().map((perm) => ({ roleId: adminRole.id, permissionId: perm.id })));
}

authRouter.post("/login", async (req, res) => {
  await ensureBootstrapAdmin();
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Invalid credentials");
  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (!user || !verifyPassword(parsed.data.password, user.passwordSalt, user.passwordHash)) {
    return sendError(res, 401, "Invalid email or password");
  }
  const session = signSession({ sub: user.id, email: user.email, roles: ["admin"] });
  res.cookie("session", session, { httpOnly: true, sameSite: "lax", secure: false, path: "/" });
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  res.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName } });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  res.json({ authenticated: true, user: req.auth });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("session", { path: "/" });
  res.json({ success: true });
});
