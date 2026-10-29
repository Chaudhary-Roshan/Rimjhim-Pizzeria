"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { formatRupees, formatPhone } from "@/lib/format";
import { OrderRecord } from "@/lib/mock-db";
import {
  CheckCircle2,
  MessageSquare,
  Clock,
  MapPin,
  ChevronRight,
  Phone,
  Bike,
  Store,
  Share2,
} from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNo = params?.orderNo as string;

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappUrl, setWhatsappUrl] = useState<string>("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/track/${orderNo}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (e) {
        console.error("Failed to load order", e);
      } finally {
        setLoading(false);
      }
    }

    if (orderNo) {
      fetchOrder();
      const savedWa = sessionStorage.getItem(`order_wa_${orderNo}`);
      if (savedWa) {
        setWhatsappUrl(savedWa);
      }
    }
  }, [orderNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="py-24 text-center text-stone-500 text-sm">
          Loading order details...
        </div>
      </div>
    );
  }

  const defaultWa = `https://wa.me/923086547672?text=Hi%20Rimjhim%20Pizzeria,%20I%20just%20placed%20order%20%23${orderNo}`;
  const activeWaUrl = whatsappUrl || defaultWa;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Celebration Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-card p-6 sm:p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
              Order Received Successfully!
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl uppercase tracking-tight text-stone-900">
              #{orderNo}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-md mx-auto">
              Your order has been recorded into our kitchen system. Please tap below to confirm on WhatsApp!
            </p>
          </div>

          {/* Primary Action: Send on WhatsApp */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Instant WhatsApp Confirmation</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Tapping the button below opens WhatsApp with your complete items and address pre-typed. Send it to ensure fastest priority kitchen preparation!
            </p>
            <a
              href={activeWaUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 px-6 rounded-xl font-heading text-xl uppercase tracking-wider flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-98"
            >
              <MessageSquare className="w-6 h-6 fill-current" />
              <span>Send Order on WhatsApp</span>
            </a>
          </div>

          {/* ETA Alert */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[11px] text-stone-400 font-semibold uppercase flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber" /> Estimated Time
              </div>
              <div className="font-heading text-2xl text-stone-800 mt-0.5">
                35 – 45 MINS
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
              <div className="text-[11px] text-stone-400 font-semibold uppercase flex items-center gap-1">
                {order?.type === "DELIVERY" ? <Bike className="w-3.5 h-3.5 text-rimjhimRed" /> : <Store className="w-3.5 h-3.5 text-rimjhimRed" />}
                <span>Fulfillment</span>
              </div>
              <div className="font-heading text-2xl text-stone-800 mt-0.5">
                {order?.type === "DELIVERY" ? "DOOR DELIVERY" : "COUNTER PICKUP"}
              </div>
            </div>
          </div>

          {/* Live Tracker Link */}
          <Link
            href={`/track/${orderNo}`}
            className="w-full bg-charcoal hover:bg-stone-800 text-white py-3.5 px-4 rounded-xl font-heading text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <span>Track Live Order Status</span>
            <ChevronRight className="w-5 h-5 text-amber" />
          </Link>

          {/* Order Details Accordion */}
          {order && (
            <div className="border-t border-stone-100 pt-5 text-left space-y-3">
              <h3 className="font-heading text-base uppercase text-stone-700">
                Order Summary
              </h3>

              <div className="divide-y divide-stone-100 text-xs">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <div>
                      <span className="font-bold text-stone-800">
                        {item.quantity}x {item.name}
                      </span>
                      {item.variantName && item.variantName !== "Regular" && (
                        <span className="text-stone-500 ml-1">({item.variantName})</span>
                      )}
                      {item.modifiers?.map((m, mIdx) => (
                        <div key={mIdx} className="text-stone-500">
                          • {m.option}
                        </div>
                      ))}
                    </div>
                    <span className="font-bold text-stone-900">
                      {formatRupees(item.lineTotal)}
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
                  <span>Total Payable</span>
                  <span className="text-rimjhimRed">{formatRupees(order.total)}</span>
                </div>
              </div>

              {order.address && (
                <div className="text-xs bg-stone-50 p-3 rounded-lg text-stone-600 space-y-0.5">
                  <div className="font-semibold text-stone-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" /> Delivery Address:
                  </div>
                  <div>{order.address}</div>
                  {order.landmark && <div>Landmark: {order.landmark}</div>}
                </div>
              )}
            </div>
          )}

          {/* Contact Helpline */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-center gap-6 text-xs text-stone-500">
            <span>Questions about your order?</span>
            <a
              href="tel:03086547672"
              className="font-bold text-rimjhimRed flex items-center gap-1 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" /> Call: 0308-6547672
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
