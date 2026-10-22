import crypto from "node:crypto";
import { promisify } from "node:util";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";

export type SessionPayload = {
  sub: string;
  email: string;
  roleIds: number[];
  roles: string[];
};

// Parameters are fixed: existing stored hashes must keep verifying.
const PBKDF2_ITERATIONS = 120000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_DIGEST = "sha256";

const pbkdf2 = promisify(crypto.pbkdf2);

// Async so a slow shared CPU does not block the event loop during logins.
export async function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const derived = await pbkdf2(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, PBKDF2_DIGEST);
  return { salt, hash: derived.toString("hex") };
}

export async function verifyPassword(password: string, salt: string, hash: string) {
  const { hash: candidate } = await hashPassword(password, salt);
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(candidate, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function signSession(payload: SessionPayload) {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifySession(token: string) {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as SessionPayload;
    return decoded;
  } catch {
    throw new Error("Invalid session");
  }
}
