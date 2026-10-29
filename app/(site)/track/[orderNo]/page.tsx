"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { formatRupees, formatPhone } from "@/lib/format";
import { OrderRecord } from "@/lib/mock-db";
import {
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Bike,
  Store,
  ChefHat,
  PackageCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function TrackOrderPage() {
  const params = useParams();
  const orderNo = params?.orderNo as string;

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/track/${orderNo}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (e) {
      console.error("Error fetching order status", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderNo) {
      fetchOrder();
      // Poll every 5 seconds as fallback
      const interval = setInterval(fetchOrder, 5000);
      return () => clearInterval(interval);
    }
  }, [orderNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="py-24 text-center text-stone-500 text-sm">
          Loading order status...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-4xl mb-3">🔎</div>
          <h2 className="font-heading text-2xl uppercase text-stone-800">Order Not Found</h2>
          <p className="text-xs text-stone-500 mt-1 mb-6">
            We couldn&apos;t locate an order with number #{orderNo}. Please double-check your order number.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-rimjhimRed text-white px-6 py-2.5 rounded-xl font-heading uppercase text-base"
          >
            Go to Menu
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { key: "NEW", label: "Order Received", desc: "Received at Rimjhim kitchen counter", icon: Clock },
    { key: "CONFIRMED", label: "Confirmed", desc: "Order accepted by kitchen staff", icon: CheckCircle2 },
    { key: "PREPARING", label: "Preparing", desc: "Baking pizza & assembling fresh items", icon: ChefHat },
    {
      key: "OUT_FOR_DELIVERY",
      label: order.type === "DELIVERY" ? "Out for Delivery" : "Ready for Pickup",
      desc: order.type === "DELIVERY" ? "Rider is heading to your address" : "Your order is ready at the counter",
      icon: order.type === "DELIVERY" ? Bike : Store,
    },
    {
      key: "COMPLETED",
      label: order.type === "DELIVERY" ? "Delivered" : "Completed",
      desc: "Enjoy your fresh meal!",
      icon: PackageCheck,
    },
  ];

  const isCancelled = order.status === "CANCELLED";

  let activeStepIndex = 0;
  if (order.status === "NEW") activeStepIndex = 0;
  else if (order.status === "CONFIRMED") activeStepIndex = 1;
  else if (order.status === "PREPARING") activeStepIndex = 2;
  else if (order.status === "OUT_FOR_DELIVERY" || order.status === "READY") activeStepIndex = 3;
  else if (order.status === "COMPLETED") activeStepIndex = 4;
  else if (isCancelled) activeStepIndex = -1;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block">
              Live Order Tracker
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight text-stone-900">
              #{order.orderNo}
            </h1>
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchOrder();
            }}
            className="p-2.5 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-stone-900 shadow-xs transition-transform active:rotate-180"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Cancellation Notice if cancelled */}
        {isCancelled && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-800 text-sm">Order Cancelled</div>
              <div className="text-xs text-red-700 mt-0.5">
                {order.cancelReason || "This order was cancelled by the restaurant or customer."}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-card p-6 sm:p-8 space-y-8">
          {/* Status banner */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">Current Status</div>
              <div className="font-heading text-2xl uppercase text-stone-900">
                {order.status.replace(/_/g, " ")}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-stone-400 font-semibold uppercase">Estimated Time</div>
              <div className="font-heading text-2xl uppercase text-amber">
                {order.etaMinutes ? `${order.etaMinutes} MINS` : "30-45 MINS"}
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          {!isCancelled && (
            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = idx <= activeStepIndex;
                const isCurrent = idx === activeStepIndex;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    {/* Step Dot / Icon */}
                    <div
                      className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        isCurrent
                          ? "bg-rimjhimRed text-white ring-4 ring-red-100"
                          : isPassed
                          ? "bg-emerald-500 text-white"
                          : "bg-stone-200 text-stone-400"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="ml-2">
                      <div
                        className={`font-heading text-lg uppercase tracking-wide leading-none ${
                          isCurrent
                            ? "text-rimjhimRed font-bold"
                            : isPassed
                            ? "text-stone-900 font-bold"
                            : "text-stone-400"
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-stone-500 mt-1">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Buttons: Call & WhatsApp */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-100">
            <a
              href="tel:03086547672"
              className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-heading text-sm uppercase flex items-center justify-center gap-2 transition-colors font-bold"
            >
              <Phone className="w-4 h-4 text-rimjhimRed" />
              <span>Call Kitchen</span>
            </a>
            <a
              href={`https://wa.me/923086547672?text=Hello%20Rimjhim%20Pizzeria,%20checking%20status%20for%20order%20%23${order.orderNo}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading text-sm uppercase flex items-center justify-center gap-2 transition-colors font-bold"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Order Details snapshot */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-6 mt-6 space-y-4">
          <h2 className="font-heading text-lg uppercase text-stone-800 border-b border-stone-100 pb-2">
            Items in this order
          </h2>
          <div className="divide-y divide-stone-100 text-xs">
            {order.items.map((it, i) => (
              <div key={i} className="py-2.5 flex justify-between">
                <div>
                  <span className="font-bold text-stone-800">
                    {it.quantity}x {it.name}
                  </span>
                  {it.variantName && it.variantName !== "Regular" && (
                    <span className="text-stone-500 ml-1">({it.variantName})</span>
                  )}
                  {it.modifiers?.map((m, mi) => (
                    <div key={mi} className="text-stone-500">
                      • {m.option}
                    </div>
                  ))}
                </div>
                <span className="font-bold text-stone-900">
                  {formatRupees(it.lineTotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-2 text-xs space-y-1">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatRupees(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>Delivery Fee</span>
                <span>{formatRupees(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-stone-900 pt-1">
              <span>Total</span>
              <span className="text-rimjhimRed font-heading text-xl">
                {formatRupees(order.total)}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
