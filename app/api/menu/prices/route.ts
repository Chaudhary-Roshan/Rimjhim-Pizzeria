import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const { percentage, roundToTen } = await request.json();

    if (typeof percentage !== "number") {
      return NextResponse.json(
        { success: false, message: "Valid percentage number required" },
        { status: 400 }
      );
    }

    const updatedItems = mockDb.applyBulkPriceAdjustment(percentage, roundToTen ?? true);

    return NextResponse.json({
      success: true,
      message: `Updated prices by ${percentage}% across ${updatedItems.length} items`,
      itemsCount: updatedItems.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to apply price adjustments" },
      { status: 500 }
    );
  }
}

