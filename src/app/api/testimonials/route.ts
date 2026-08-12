import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";

export async function GET() {
  try {
    const all = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.active, true));
    return NextResponse.json(all);
  } catch (err) {
    console.error("Failed to fetch testimonials:", err);
    return NextResponse.json(
      { error: "Failed to load testimonials", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
