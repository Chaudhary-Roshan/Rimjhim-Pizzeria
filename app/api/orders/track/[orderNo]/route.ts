import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNo: string }> }
) {
  const { orderNo } = await params;
  const order = mockDb.getOrderByIdOrNo(orderNo);

  // If query might be a phone number, also return list of matching orders
  const phoneOrders = mockDb.getOrdersByPhone(orderNo);

  if (!order && phoneOrders.length === 0) {
    return NextResponse.json(
      { success: false, message: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    order: order || phoneOrders[0],
    orders: phoneOrders,
  });
}
