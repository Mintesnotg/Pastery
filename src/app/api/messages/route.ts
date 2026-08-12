import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.createdAt));
    return NextResponse.json(list);
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    return NextResponse.json(
      { error: "Failed to load messages", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
