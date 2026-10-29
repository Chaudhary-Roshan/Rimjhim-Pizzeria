import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET() {
  const settings = mockDb.getSettings();
  const zones = mockDb.getZones();

  return NextResponse.json({
    success: true,
    data: {
      ...settings,
      zones,
      isOpenNow: true,
    },
  });
}
