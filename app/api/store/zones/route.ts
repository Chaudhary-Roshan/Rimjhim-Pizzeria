import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";
import { DeliveryZoneSeed } from "@/lib/initial-data";

export async function POST(request: NextRequest) {
  try {
    const { zones } = await request.json();

    if (!Array.isArray(zones)) {
      return NextResponse.json(
        { success: false, message: "Zones array required" },
        { status: 400 }
      );
    }

    const updated = mockDb.updateDeliveryZones(zones as DeliveryZoneSeed[]);

    return NextResponse.json({
      success: true,
      zones: updated,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update delivery zones" },
      { status: 500 }
    );
  }
}

