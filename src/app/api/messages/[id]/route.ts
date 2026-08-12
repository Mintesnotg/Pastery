import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const msgId = parseInt(id, 10);
    if (isNaN(msgId)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(messages)
      .where(eq(messages.id, msgId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Failed to delete message:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
