"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatRupees } from "@/lib/format";
import { OrderRecord } from "@/lib/mock-db";
import {
  TrendingUp,
  ShoppingBag,
  UtensilsCrossed,
  Users,
  ShieldCheck,
  Plus,
  Percent,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Flame,
  Power,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, menuRes, custRes, storeRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/menu"),
          fetch("/api/customers"),
          fetch("/api/store"),
        ]);

        const [ordersData, menuData, custData, storeData] = await Promise.all([
          ordersRes.json(),
          menuRes.json(),
          custRes.json(),
          storeRes.json(),
        ]);

        if (ordersData.success) setOrders(ordersData.orders || []);
        if (menuData.success) setItems(menuData.data?.items || []);
        if (custData.success) setCustomers(custData.customers || []);
        if (storeData.success) setSettings(storeData.data);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalSales = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrdersCount = orders.filter(
    (o) => o.status === "NEW" || o.status === "PREPARING" || o.status === "READY"
  ).length;

  const soldOutItemsCount = items.filter((i) => i.isAvailable === false).length;
  const inStockItemsCount = items.length - soldOutItemsCount;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-charcoal via-charcoal-dark to-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rimjhimRed/20 to-amber/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
              <span>Rimjhim Restaurant Operating System</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-wider text-white">
              Executive Store Overview
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl leading-relaxed">
              Real-time monitoring of menu stock, customer CRM directory, store pricing, and active kitchen operations.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/menu"
              className="px-4 py-2.5 rounded-xl bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-xs font-bold tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </Link>
            <Link
              href="/owner/orders"
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-heading uppercase text-xs font-bold tracking-wider flex items-center gap-2 border border-stone-700 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-amber" />
              <span>Live Orders ({activeOrdersCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800/90 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Total Sales Today
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-heading text-3xl text-white font-bold leading-tight">
              {formatRupees(totalSales)}
            </div>
            <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold font-mono">
                {orders.filter((o) => o.status === "COMPLETED").length}
              </span>{" "}
              completed orders
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800/90 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Active In Kitchen
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber/10 text-amber flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-heading text-3xl text-amber font-bold leading-tight">
              {activeOrdersCount}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Live orders being prepared or ready
            </div>
          </div>
        </div>

        {/* Catalog Items */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800/90 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Menu Catalog
            </span>
            <div className="w-8 h-8 rounded-xl bg-rimjhimRed/10 text-rimjhimRed flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-heading text-3xl text-white font-bold leading-tight">
              {items.length}
            </div>
            <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{inStockItemsCount} In Stock</span>
              {soldOutItemsCount > 0 && (
                <span className="text-red-400 font-semibold">• {soldOutItemsCount} Sold Out</span>
              )}
            </div>
          </div>
        </div>

        {/* Customer Base */}
        <div className="bg-charcoal p-5 rounded-2xl border border-stone-800/90 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Customer CRM
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-heading text-3xl text-white font-bold leading-tight">
              {customers.length}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Profiles with order frequency & spend
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Management Tools & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Control Modules (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Management Shortcuts */}
          <div className="bg-charcoal p-6 rounded-3xl border border-stone-800/90 space-y-4">
            <h2 className="font-heading text-xl uppercase tracking-wider text-white">
              Executive Management Modules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Menu Module */}
              <Link
                href="/admin/menu"
                className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 hover:border-amber/40 transition-all group flex items-start gap-3.5"
              >
                <div className="p-3 rounded-xl bg-amber/10 text-amber group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading uppercase text-sm tracking-wide text-white group-hover:text-amber transition-colors">
                    Menu Items & Sold Out
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Add new items, adjust recipes, and toggle sold-out switches instantly.
                  </p>
                </div>
              </Link>

              {/* Customers CRM Module */}
              <Link
                href="/admin/customers"
                className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 hover:border-amber/40 transition-all group flex items-start gap-3.5"
              >
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading uppercase text-sm tracking-wide text-white group-hover:text-amber transition-colors">
                    Customer Directory & CRM
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    View customer spend, order history, block fraud numbers, and add notes.
                  </p>
                </div>
              </Link>

              {/* Staff & PINs */}
              <Link
                href="/admin/staff"
                className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 hover:border-amber/40 transition-all group flex items-start gap-3.5"
              >
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading uppercase text-sm tracking-wide text-white group-hover:text-amber transition-colors">
                    Staff & 4-Digit POS PINs
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Set cashier & manager PINs, assign roles, and revoke account access.
                  </p>
                </div>
              </Link>

              {/* Bulk Prices */}
              <Link
                href="/admin/prices"
                className="p-4 rounded-2xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 hover:border-amber/40 transition-all group flex items-start gap-3.5"
              >
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading uppercase text-sm tracking-wide text-white group-hover:text-amber transition-colors">
                    Bulk Price Adjuster
                  </div>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Apply percentage price changes across all pizzas with simulated preview.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-charcoal p-6 rounded-3xl border border-stone-800/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl uppercase tracking-wider text-white">
                Recent Orders Stream
              </h2>
              <Link
                href="/owner/orders"
                className="text-xs text-amber hover:underline font-semibold flex items-center gap-1"
              >
                <span>Live Kanban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-stone-800 overflow-hidden rounded-xl border border-stone-800">
              {orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 bg-stone-900/60 hover:bg-stone-900 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white text-sm">
                      #{ord.orderNo}
                    </span>
                    <span className="text-stone-300 font-medium">{ord.customerName}</span>
                    <span className="text-stone-500 hidden sm:inline">
                      • {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-amber">
                      {formatRupees(ord.total)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === "NEW"
                          ? "bg-amber/20 text-amber border border-amber/30"
                          : ord.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-stone-800 text-stone-300"
                      }`}
                    >
                      {ord.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Store Status & Info Widget */}
        <div className="space-y-6">
          <div className="bg-charcoal p-6 rounded-3xl border border-stone-800/90 space-y-4">
            <h2 className="font-heading text-xl uppercase tracking-wider text-white">
              Branch Status
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Online Order Acceptance</div>
                  <div className="text-[11px] text-stone-400">
                    {settings?.acceptingOrders !== false ? "Open for Online Delivery" : "Paused / Closed"}
                  </div>
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Operating Hours:</span>
                  <span className="text-white font-mono font-semibold">12:00 PM – 03:00 AM</span>
                </div>
                <div className="flex items-center justify-between text-stone-400">
                  <span>Day Cut-Off Hour:</span>
                  <span className="text-amber font-mono font-semibold">4:00 AM</span>
                </div>
                <div className="flex items-center justify-between text-stone-400">
                  <span>Primary Location:</span>
                  <span className="text-white">Commercial Area, Satellite Town</span>
                </div>
              </div>

              <Link
                href="/admin/settings"
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-heading uppercase text-xs font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Edit Branch Settings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
