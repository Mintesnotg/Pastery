import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    await db.insert(messages).values({ name, email, subject, message });

    return NextResponse.json(
      { success: true, message: "Thanks for your message — we'll be in touch shortly." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to send message:", err);
    return NextResponse.json(
      { error: "Something went wrong sending your message.", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
