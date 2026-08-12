import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type SessionPayload = {
  sub: string;
  email: string;
  roles: string[];
};

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  return hashPassword(password, salt).hash === hash;
}

export function signSession(payload: SessionPayload) {
  const ttlSeconds = env.sessionTtlDays * 24 * 60 * 60;
  return jwt.sign(payload, env.jwtSecret, { expiresIn: ttlSeconds });
}

export function verifySession(token: string) {
  return jwt.verify(token, env.jwtSecret) as SessionPayload;
}
