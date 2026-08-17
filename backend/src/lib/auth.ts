import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type SessionPayload = {
  sub: string;
  email: string;
  roleIds: number[];
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
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifySession(token: string) {
  return jwt.verify(token, env.jwtSecret) as SessionPayload;
}
