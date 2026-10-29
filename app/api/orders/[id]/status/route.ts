import { NextRequest, NextResponse } from "next/server";
import { mockDb, OrderRecord } from "@/lib/mock-db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, etaMinutes, cancelReason } = body as {
      status: OrderRecord["status"];
      etaMinutes?: number;
      cancelReason?: string;
    };

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    const updated = mockDb.updateOrderStatus(id, status, etaMinutes, cancelReason);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 }
    );
  }
}
