import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET() {
  const shift = mockDb.getCurrentShift();
  const orders = mockDb.getOrders();

  const cashOrders = orders.filter((o) => o.paymentMethod === "CASH" && o.status === "COMPLETED");
  const cashSales = cashOrders.reduce((sum, o) => sum + o.total, 0);

  return NextResponse.json({
    success: true,
    shift: {
      ...shift,
      currentCashSales: cashSales,
      expectedInDrawer: (shift?.openingCash || 0) + cashSales,
    },
  });
}
