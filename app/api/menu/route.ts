import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";
import { MODIFIER_GROUPS_DATA } from "@/lib/initial-data";

export async function GET() {
  const categories = mockDb.getCategories();
  const items = mockDb.getItems();
  const zones = mockDb.getZones();

  return NextResponse.json({
    success: true,
    data: {
      categories,
      items,
      modifierGroups: MODIFIER_GROUPS_DATA,
      zones,
    },
  });
}
