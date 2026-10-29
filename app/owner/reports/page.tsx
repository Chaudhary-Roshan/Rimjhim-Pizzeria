"use client";

import { useState, useEffect } from "react";
import { OrderRecord } from "@/lib/mock-db";
import { formatRupees } from "@/lib/format";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Store,
  Bike,
  CreditCard,
  Download,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function OwnerReportsPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = completedOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  const onlineOrders = completedOrders.filter((o) => o.channel === "ONLINE");
  const posOrders = completedOrders.filter((o) => o.channel === "POS");

  const onlineSales = onlineOrders.reduce((sum, o) => sum + o.total, 0);
  const posSales = posOrders.reduce((sum, o) => sum + o.total, 0);

  const cashSales = completedOrders
    .filter((o) => o.paymentMethod === "CASH")
    .reduce((sum, o) => sum + o.total, 0);

  const cancellations = orders.filter((o) => o.status === "CANCELLED");

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Order No", "Time", "Channel", "Type", "Status", "Total", "Payment Method", "Customer"];
    const rows = orders.map((o) => [
      o.orderNo,
      new Date(o.createdAt).toLocaleString(),
      o.channel,
      o.type,
      o.status,
      o.total,
      o.paymentMethod,
      `"${o.customerName} (${o.customerPhone})"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rimjhim_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-5 rounded-2xl border border-stone-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
            Today&apos;s Sales & Analytics
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Complete reconciliation of online and counter sales with zero double-entry.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-sm px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 uppercase font-semibold">
            <span>Net Sales</span>
            <DollarSign className="w-4 h-4 text-freshLime" />
          </div>
          <div className="font-heading text-3xl sm:text-4xl text-white font-bold">
            {formatRupees(totalSales)}
          </div>
          <div className="text-[11px] text-stone-400">
            Across {totalOrdersCount} completed orders
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 uppercase font-semibold">
            <span>Avg Order Value</span>
            <TrendingUp className="w-4 h-4 text-amber" />
          </div>
          <div className="font-heading text-3xl sm:text-4xl text-amber font-bold">
            {formatRupees(avgOrderValue)}
          </div>
          <div className="text-[11px] text-stone-400">
            Per paying ticket
          </div>
        </div>

        {/* Online vs Counter */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 uppercase font-semibold">
            <span>Online Orders</span>
            <Bike className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading text-3xl sm:text-4xl text-white font-bold">
            {onlineOrders.length}
          </div>
          <div className="text-[11px] text-stone-400">
            Sales: {formatRupees(onlineSales)}
          </div>
        </div>

        {/* Counter POS */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-400 uppercase font-semibold">
            <span>Counter POS</span>
            <Store className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-heading text-3xl sm:text-4xl text-white font-bold">
            {posOrders.length}
          </div>
          <div className="text-[11px] text-stone-400">
            Sales: {formatRupees(posSales)}
          </div>
        </div>
      </div>

      {/* Second Row: Payment Methods & Shift Cash */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods Breakdown */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800 space-y-4">
          <h3 className="font-heading text-lg uppercase tracking-wider text-white">
            Collections by Payment Method
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-stone-900 rounded-xl border border-stone-800">
              <span className="font-semibold text-stone-300">Cash in Hand / Drawer</span>
              <span className="font-heading text-base text-freshLime font-bold">
                {formatRupees(cashSales)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-stone-900 rounded-xl border border-stone-800">
              <span className="font-semibold text-stone-300">JazzCash / Easypaisa (Direct)</span>
              <span className="font-heading text-base text-stone-300 font-bold">
                {formatRupees(totalSales - cashSales)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-stone-900 rounded-xl border border-stone-800">
              <span className="font-semibold text-stone-300">Cancelled / Void Orders</span>
              <span className="font-heading text-base text-red-400 font-bold">
                {cancellations.length} orders
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800 space-y-4">
          <h3 className="font-heading text-lg uppercase tracking-wider text-white">
            Recent Completed Sales
          </h3>

          <div className="divide-y divide-stone-800/80 max-h-60 overflow-y-auto text-xs">
            {completedOrders.length === 0 ? (
              <div className="py-8 text-center text-stone-500">
                No completed orders registered yet today
              </div>
            ) : (
              completedOrders.slice(0, 8).map((o) => (
                <div key={o.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-mono text-white font-bold">#{o.orderNo}</span>
                    <span className="text-stone-400 ml-2">
                      ({o.channel} • {o.type})
                    </span>
                    <div className="text-[11px] text-stone-500">{o.customerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-base text-amber font-bold">
                      {formatRupees(o.total)}
                    </div>
                    <div className="text-[10px] text-stone-400 uppercase">
                      {o.paymentMethod}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
