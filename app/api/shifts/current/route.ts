import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET() {
  const shift = mockDb.getCurrentShift();
  const history = mockDb.getShiftHistory();
  const orders = mockDb.getOrders();

  const shiftOrders = shift
    ? orders.filter(
        (o) =>
          o.status !== "CANCELLED" &&
          (o.paymentStatus === "PAID" || o.status === "COMPLETED") &&
          (!shift.openedAt || new Date(o.createdAt) >= new Date(shift.openedAt))
      )
    : [];

  const cashOrders = shiftOrders.filter((o) => o.paymentMethod === "CASH");
  const cardOrders = shiftOrders.filter((o) => o.paymentMethod === "CARD");
  const jazzCashOrders = shiftOrders.filter((o) => o.paymentMethod === "JAZZCASH");
  const easyPaisaOrders = shiftOrders.filter((o) => o.paymentMethod === "EASYPAISA");

  const cashSales = cashOrders.reduce((sum, o) => sum + o.total, 0);
  const cardSales = cardOrders.reduce((sum, o) => sum + o.total, 0);
  const jazzCashSales = jazzCashOrders.reduce((sum, o) => sum + o.total, 0);
  const easyPaisaSales = easyPaisaOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSales = cashSales + cardSales + jazzCashSales + easyPaisaSales;

  const dineInOrders = shiftOrders.filter((o) => o.type === "DINE_IN");
  const takeawayOrders = shiftOrders.filter((o) => o.type === "TAKEAWAY");
  const deliveryOrders = shiftOrders.filter((o) => o.type === "DELIVERY");

  const dineInSales = dineInOrders.reduce((sum, o) => sum + o.total, 0);
  const takeawaySales = takeawayOrders.reduce((sum, o) => sum + o.total, 0);
  const deliverySales = deliveryOrders.reduce((sum, o) => sum + o.total, 0);

  const discountsTotal = shiftOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const deliveryFeesTotal = shiftOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  const transactions = shift?.transactions || [];
  const cashInTotal = transactions
    .filter((t) => t.type === "CASH_IN")
    .reduce((sum, t) => sum + t.amount, 0);
  const safeDropTotal = transactions
    .filter((t) => t.type === "SAFE_DROP")
    .reduce((sum, t) => sum + t.amount, 0);
  const expensesTotal = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const openingFloat = shift?.openingCash || 0;
  const expectedInDrawer = openingFloat + cashSales + cashInTotal - safeDropTotal - expensesTotal;

  return NextResponse.json({
    success: true,
    shift: shift
      ? {
          ...shift,
          currentCashSales: cashSales,
          cashSales,
          cardSales,
          jazzCashSales,
          easyPaisaSales,
          totalSales,
          ordersCount: shiftOrders.length,
          dineInOrdersCount: dineInOrders.length,
          takeawayOrdersCount: takeawayOrders.length,
          deliveryOrdersCount: deliveryOrders.length,
          dineInSales,
          takeawaySales,
          deliverySales,
          discountsTotal,
          deliveryFeesTotal,
          cashInTotal,
          safeDropTotal,
          expensesTotal,
          expectedInDrawer,
          transactions,
        }
      : null,
    history,
  });
}
