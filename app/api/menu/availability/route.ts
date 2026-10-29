import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const { itemId, isAvailable } = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "itemId is required" },
        { status: 400 }
      );
    }

    const updated = mockDb.toggleItemAvailability(itemId, isAvailable);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update item availability" },
      { status: 500 }
    );
  }
}

