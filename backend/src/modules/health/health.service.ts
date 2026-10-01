import { pingDatabase } from "./health.repository.js";

export async function checkHealth() {
  try {
    await pingDatabase();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
