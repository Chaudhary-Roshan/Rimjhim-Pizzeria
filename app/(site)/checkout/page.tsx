"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { useCartStore } from "@/lib/store";
import { formatRupees, formatPhone, isValidPakistaniPhone } from "@/lib/format";
import { DELIVERY_ZONES_DATA } from "@/lib/initial-data";
import {
  Bike,
  Store,
  MapPin,
  Phone,
  User,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Navigation,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    items,
    orderType,
    setOrderType,
    selectedZoneName,
    setDeliveryZone,
    deliveryFee,
    getSubtotal,
    getTotal,
    clearCart,
    initStore,
  } = useCartStore();

  useEffect(() => {
    initStore();
    setMounted(true);
  }, [initStore]);

  const subtotal = getSubtotal();
  const total = getTotal();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [note, setNote] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState<string>("");

  const currentZone = DELIVERY_ZONES_DATA.find((z) => z.name === selectedZoneName) || DELIVERY_ZONES_DATA[0];
  const minOrder = orderType === "DELIVERY" ? currentZone.minOrder : 0;
  const isMinOrderMet = subtotal >= minOrder;

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      return;
    }
    setLocationStatus("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("GPS Location pinned! (Saved)");
      },
      () => {
        setLocationStatus("Could not detect location. Please type address.");
      }
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!isValidPakistaniPhone(phone)) {
      setErrorMessage("Please enter a valid Pakistani phone number (e.g. 0300-1234567).");
      return;
    }

    if (orderType === "DELIVERY" && !address.trim()) {
      setErrorMessage("Please enter your full delivery address.");
      return;
    }

    if (orderType === "DELIVERY" && !isMinOrderMet) {
      setErrorMessage(`Minimum order for ${selectedZoneName} is ${formatRupees(minOrder)}.`);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "ONLINE",
          type: orderType,
          customerName: name.trim(),
          customerPhone: phone.trim(),
          address: orderType === "DELIVERY" ? address.trim() : undefined,
          landmark: landmark.trim() || undefined,
          deliveryFee: orderType === "DELIVERY" ? deliveryFee : 0,
          paymentMethod: "CASH",
          customerNote: note.trim() || undefined,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            variantName: i.variantName,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            modifiers: i.modifiers || [],
            note: i.note,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      // Save order info to session for instant WhatsApp launch on the order page
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`order_wa_${data.order.orderNo}`, data.whatsappUrl);
      }

      // Clear client cart
      clearCart();

      // Redirect to success page
      router.push(`/order/${data.order.orderNo}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting order. Please try again.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-stone-400">
          Loading checkout...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h2 className="font-heading text-2xl text-stone-800 uppercase">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500 mt-2 mb-6">
            Looks like you haven&apos;t added any pizzas or deals yet.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-rimjhimRed hover:bg-rimjhimRed-dark text-white px-6 py-3 rounded-xl font-heading text-lg uppercase tracking-wide shadow-md"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/menu"
            className="p-2 rounded-full hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl uppercase tracking-tight">
            Checkout & Confirmation
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Form Column */}
          <div className="md:col-span-7 space-y-6">
            {/* 1. Fulfillment Type */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
              <label className="font-heading text-base uppercase tracking-wider text-stone-800 font-bold block mb-3">
                1. Order Fulfillment
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType("DELIVERY")}
                  className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    orderType === "DELIVERY"
                      ? "border-rimjhimRed bg-red-50/70 text-rimjhimRed ring-2 ring-rimjhimRed font-bold shadow-xs"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <Bike className="w-5 h-5" />
                  <span className="text-sm">Delivery to Door</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("TAKEAWAY")}
                  className={`p-3.5 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                    orderType === "TAKEAWAY"
                      ? "border-rimjhimRed bg-red-50/70 text-rimjhimRed ring-2 ring-rimjhimRed font-bold shadow-xs"
                      : "border-stone-200 text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span className="text-sm">Pickup at Counter</span>
                </button>
              </div>
            </div>

            {/* 2. Customer Contact Details */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <label className="font-heading text-base uppercase tracking-wider text-stone-800 font-bold block">
                2. Contact Information
              </label>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Your Full Name <span className="text-rimjhimRed">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  WhatsApp / Phone Number <span className="text-rimjhimRed">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Used for WhatsApp confirmation and live delivery status updates.
                </p>
              </div>
            </div>

            {/* 3. Delivery Details (if delivery) */}
            {orderType === "DELIVERY" && (
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <label className="font-heading text-base uppercase tracking-wider text-stone-800 font-bold block">
                  3. Delivery Location in Bahawalpur
                </label>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Select Area / Town:
                  </label>
                  <select
                    value={selectedZoneName}
                    onChange={(e) => {
                      const zone = DELIVERY_ZONES_DATA.find((z) => z.name === e.target.value);
                      if (zone) setDeliveryZone(zone.name, zone.fee);
                    }}
                    className="w-full text-sm bg-white border border-stone-300 rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber focus:outline-hidden"
                  >
                    {DELIVERY_ZONES_DATA.map((zone) => (
                      <option key={zone.name} value={zone.name}>
                        {zone.name} — Fee: {formatRupees(zone.fee)} (Min: {formatRupees(zone.minOrder)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700">
                      Complete Street Address <span className="text-rimjhimRed">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleUseLocation}
                      className="text-[11px] font-semibold text-rimjhimRed hover:underline flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Pin My GPS Location
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Flat #, Street #, Block or Sector..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber"
                    />
                  </div>
                  {locationStatus && (
                    <p className="text-[11px] text-amber-700 font-medium mt-1">
                      {locationStatus}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Famous Nearby Landmark:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Faysal Bank, Behind Govt High School..."
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber"
                  />
                </div>
              </div>
            )}

            {/* 4. Payment Method & Instructions */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <label className="font-heading text-base uppercase tracking-wider text-stone-800 font-bold block">
                {orderType === "DELIVERY" ? "4. Payment Method" : "3. Payment Method"}
              </label>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber shrink-0" />
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    {orderType === "DELIVERY" ? "Cash on Delivery (COD)" : "Cash at Counter"}
                  </div>
                  <div className="text-xs text-stone-600">
                    Pay safely in whole rupees when your hot food arrives.
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Order Note (optional):
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <textarea
                    rows={2}
                    placeholder="Any cooking preference, extra napkins, cutlery, or directions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="md:col-span-5">
            <div className="sticky top-24 bg-white p-5 rounded-3xl border border-stone-200 shadow-card space-y-4">
              <h2 className="font-heading text-xl uppercase tracking-wide text-stone-900 pb-2 border-b border-stone-100">
                Order Summary ({items.reduce((c, i) => c + i.quantity, 0)})
              </h2>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-2.5 text-xs flex justify-between gap-2">
                    <div>
                      <div className="font-bold text-stone-800">
                        {item.quantity}x {item.name}
                      </div>
                      {item.variantName && item.variantName !== "Regular" && (
                        <div className="text-stone-500">Size: {item.variantName}</div>
                      )}
                      {item.modifiers?.map((m, i) => (
                        <div key={i} className="text-stone-500">
                          • {m.option}
                        </div>
                      ))}
                    </div>
                    <div className="font-bold text-stone-900">
                      {formatRupees(item.unitPrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="border-t border-stone-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatRupees(subtotal)}</span>
                </div>
                {orderType === "DELIVERY" && (
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-stone-900">{formatRupees(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-stone-900 border-t border-stone-200 pt-2">
                  <span>Total Amount</span>
                  <span className="text-rimjhimRed font-heading text-2xl">
                    {formatRupees(total)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || (orderType === "DELIVERY" && !isMinOrderMet)}
                className={`w-full py-4 rounded-2xl font-heading text-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSubmitting || (orderType === "DELIVERY" && !isMinOrderMet)
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-rimjhimRed hover:bg-rimjhimRed-dark text-white active:scale-98"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <span>Confirm & Place Order</span>
                )}
              </button>

              <div className="text-center text-[11px] text-stone-500 pt-1">
                🔒 Guaranteed whole-rupee prices. No surprise delivery markup.
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
