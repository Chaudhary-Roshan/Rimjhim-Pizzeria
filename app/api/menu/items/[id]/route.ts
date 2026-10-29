import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const updated = mockDb.updateMenuItem(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = mockDb.deleteMenuItem(id);

    return NextResponse.json({ success: true, deleted });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete item" }, { status: 500 });
  }
}

