import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, amount, reason, staffName } = body;

    if (!type || !["CASH_IN", "SAFE_DROP", "EXPENSE"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid transaction type" },
        { status: 400 }
      );
    }

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, message: "A reason or description is required" },
        { status: 400 }
      );
    }

    const tx = mockDb.addShiftTransaction(
      type,
      Number(amount),
      reason.trim(),
      staffName?.trim() || "Counter Staff"
    );

    if (!tx) {
      return NextResponse.json(
        { success: false, message: "No active shift is currently open" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, transaction: tx });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e.message || "Failed to record cash transaction" },
      { status: 500 }
    );
  }
}
