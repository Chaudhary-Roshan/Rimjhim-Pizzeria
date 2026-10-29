"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Bike, Store } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatRupees } from "@/lib/format";
import { DELIVERY_ZONES_DATA } from "@/lib/initial-data";

export function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    orderType,
    setOrderType,
    selectedZoneName,
    setDeliveryZone,
    deliveryFee,
    getSubtotal,
    getTotal,
    getTotalCount,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getSubtotal();
  const total = getTotal();
  const totalCount = getTotalCount();

  const currentZone = DELIVERY_ZONES_DATA.find((z) => z.name === selectedZoneName) || DELIVERY_ZONES_DATA[0];
  const minOrder = orderType === "DELIVERY" ? currentZone.minOrder : 0;
  const isMinOrderMet = subtotal >= minOrder;
  const amountToMin = minOrder - subtotal;

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen, mounted]);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => toggleCart(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-stone-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-charcoal text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber" />
              <h2 className="font-heading text-xl uppercase tracking-wide">
                Your Order ({totalCount})
              </h2>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Delivery or Takeaway Switch */}
          <div className="p-4 bg-stone-100 border-b border-stone-200">
            <div className="grid grid-cols-2 p-1 bg-stone-200 rounded-lg text-sm font-medium">
              <button
                type="button"
                onClick={() => setOrderType("DELIVERY")}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-all ${
                  orderType === "DELIVERY"
                    ? "bg-white text-rimjhimRed font-bold shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Bike className="w-4 h-4" /> Delivery
              </button>
              <button
                type="button"
                onClick={() => setOrderType("TAKEAWAY")}
                className={`py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-all ${
                  orderType === "TAKEAWAY"
                    ? "bg-white text-rimjhimRed font-bold shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <Store className="w-4 h-4" /> Pickup
              </button>
            </div>

            {orderType === "DELIVERY" && (
              <div className="mt-3">
                <label className="text-xs text-stone-600 font-medium block mb-1">
                  Delivery Area (Bahawalpur):
                </label>
                <select
                  value={selectedZoneName}
                  onChange={(e) => {
                    const zone = DELIVERY_ZONES_DATA.find((z) => z.name === e.target.value);
                    if (zone) setDeliveryZone(zone.name, zone.fee);
                  }}
                  className="w-full text-xs bg-white border border-stone-300 rounded-md p-2 font-medium focus:ring-2 focus:ring-amber focus:outline-hidden"
                >
                  {DELIVERY_ZONES_DATA.map((zone) => (
                    <option key={zone.name} value={zone.name}>
                      {zone.name} (+{formatRupees(zone.fee)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-3xl mb-4">
                  🍕
                </div>
                <h3 className="font-heading text-xl text-stone-800 mb-1">Your cart is empty</h3>
                <p className="text-sm text-stone-500 max-w-xs mb-6">
                  Add your favorite piping hot pizzas, crispy burgers, and combos to start your order.
                </p>
                <button
                  onClick={() => toggleCart(false)}
                  className="bg-rimjhimRed hover:bg-rimjhimRed-dark text-white font-medium text-sm px-6 py-2.5 rounded-full transition-all"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-stone-900 text-sm leading-snug">
                        {item.name}
                      </h4>
                      <span className="font-bold text-stone-900 text-sm ml-2">
                        {formatRupees(item.unitPrice * item.quantity)}
                      </span>
                    </div>

                    {/* Variant & Modifier tags */}
                    <div className="text-xs text-stone-500 mt-1 space-y-0.5">
                      {item.variantName && item.variantName !== "Regular" && item.variantName !== "Standard" && (
                        <span className="inline-block bg-stone-100 px-2 py-0.5 rounded text-[11px] font-medium mr-1.5">
                          Size: {item.variantName}
                        </span>
                      )}
                      {item.modifiers?.map((mod, i) => (
                        <div key={i} className="text-stone-600">
                          • {mod.option} {mod.priceDelta > 0 && `(+${formatRupees(mod.priceDelta)})`}
                        </div>
                      ))}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="inline-flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 px-2.5 hover:bg-stone-200 text-stone-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-bold text-xs min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 px-2.5 hover:bg-stone-200 text-stone-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 p-5 bg-stone-50 space-y-3">
              {/* Minimum Order Warning */}
              {orderType === "DELIVERY" && !isMinOrderMet && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  Minimum delivery order for this zone is {formatRupees(minOrder)}. Please add{" "}
                  <strong>{formatRupees(amountToMin)}</strong> more to proceed.
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-800">{formatRupees(subtotal)}</span>
                </div>
                {orderType === "DELIVERY" && (
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Fee ({selectedZoneName.split("(")[0]})</span>
                    <span className="font-semibold text-stone-800">{formatRupees(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-2">
                  <span>Total Payable</span>
                  <span className="text-rimjhimRed">{formatRupees(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => toggleCart(false)}
                className={`w-full py-3.5 rounded-xl font-heading text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isMinOrderMet
                    ? "bg-rimjhimRed hover:bg-rimjhimRed-dark text-white active:scale-98"
                    : "bg-stone-300 text-stone-500 cursor-not-allowed pointer-events-none"
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
