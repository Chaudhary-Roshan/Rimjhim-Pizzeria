"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Search, ArrowRight, Clock, Phone, Bike, Store, Loader2, PackageCheck } from "lucide-react";
import { formatRupees, formatPhone } from "@/lib/format";
import { OrderRecord } from "@/lib/mock-db";

export default function MyOrdersPage() {
  const router = useRouter();
  const [phoneOrOrderNo, setPhoneOrOrderNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundOrders, setFoundOrders] = useState<OrderRecord[] | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFoundOrders(null);

    const query = phoneOrOrderNo.trim();
    if (!query) {
      setError("Please enter your phone number or order number.");
      return;
    }

    // If starts with RP- or #, directly navigate to track page
    if (query.toUpperCase().startsWith("RP-") || query.startsWith("#")) {
      const cleanNo = query.replace("#", "").trim();
      router.push(`/track/${cleanNo}`);
      return;
    }

    // Otherwise, check if phone number
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(`No orders found for "${query}". Please check your order number or phone number.`);
        return;
      }

      if (data.orders && data.orders.length > 1) {
        setFoundOrders(data.orders);
      } else if (data.order) {
        router.push(`/track/${data.order.orderNo}`);
      } else {
        setError("No orders found.");
      }
    } catch {
      setError("Failed to fetch order information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar />

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-card p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto text-2xl">
            📦
          </div>

          <div>
            <h1 className="font-heading text-3xl uppercase tracking-tight text-stone-900">
              Track Your Order
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              Enter your Order Number (e.g. RP-261029-001) or Phone Number to view live kitchen and delivery status.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="RP-261029-001 or 03001234567"
                value={phoneOrOrderNo}
                onChange={(e) => setPhoneOrOrderNo(e.target.value)}
                className="w-full text-sm pl-11 pr-4 py-3.5 rounded-2xl border border-stone-300 font-mono focus:ring-2 focus:ring-amber focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rimjhimRed hover:bg-rimjhimRed-dark text-white py-3.5 rounded-2xl font-heading text-lg uppercase tracking-wider shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching Orders...</span>
                </>
              ) : (
                <>
                  <span>Track Order Status</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Multiple Orders Found List */}
          {foundOrders && foundOrders.length > 0 && (
            <div className="text-left pt-4 border-t border-stone-100 space-y-3">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Found {foundOrders.length} Orders for this Phone
              </h3>
              <div className="space-y-2">
                {foundOrders.map((ord) => (
                  <Link
                    key={ord.id}
                    href={`/track/${ord.orderNo}`}
                    className="block p-3.5 rounded-2xl border border-stone-200 hover:border-amber bg-stone-50 hover:bg-white transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-base uppercase font-bold text-stone-900">
                        #{ord.orderNo}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {ord.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
                      <span>{ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}</span>
                      <span className="font-bold text-stone-900">{formatRupees(ord.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-stone-100 pt-6 text-xs text-stone-500">
            <span>Need immediate help with your order?</span>
            <div className="mt-2">
              <a
                href="tel:03086547672"
                className="font-bold text-rimjhimRed hover:underline"
              >
                Call Kitchen: 0308-6547672
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
