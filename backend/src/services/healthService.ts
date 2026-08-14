import { pingDatabase } from "../repositories/healthRepository.js";

export async function checkHealth() {
  try {
    await pingDatabase();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
