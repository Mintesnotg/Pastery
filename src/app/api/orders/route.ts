import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
    return NextResponse.json(list);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders", detail: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, email, phone, pickupDate, pickupTime, notes, items, total } = body;

    if (!customerName || !email || !pickupDate || !pickupTime || !items || total === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [order] = await db
      .insert(orders)
      .values({
        customerName,
        email,
        phone: phone || null,
        pickupDate,
        pickupTime,
        notes: notes || null,
        items: JSON.stringify(items),
        total: String(total),
      })
      .returning();

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json(
      { error: "Failed to place order", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
