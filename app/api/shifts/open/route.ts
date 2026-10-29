import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cashierName, openingCash } = body;

    const shift = mockDb.openShift(cashierName || "Counter Staff", Number(openingCash) || 0);
    return NextResponse.json({ success: true, shift });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to open shift" }, { status: 500 });
  }
}
