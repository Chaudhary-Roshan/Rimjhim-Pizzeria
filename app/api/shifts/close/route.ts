import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cashierName, countedCash, notes } = body;

    const closed = mockDb.closeShift(
      cashierName || "Counter Staff",
      Number(countedCash) || 0,
      notes
    );
    return NextResponse.json({ success: true, shift: closed });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to close shift" }, { status: 500 });
  }
}
