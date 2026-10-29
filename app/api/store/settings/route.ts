import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, message: "Settings object required" },
        { status: 400 }
      );
    }

    const updated = mockDb.updateStoreSettings(settings);

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update store settings" },
      { status: 500 }
    );
  }
}

