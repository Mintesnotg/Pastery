import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";

export async function pingDatabase() {
  await db.execute(sql`select 1`);
}
