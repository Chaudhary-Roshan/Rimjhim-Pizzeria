"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  CATEGORIES_DATA,
  MENU_ITEMS_DATA,
  MODIFIER_GROUPS_DATA,
  MenuItemSeed,
} from "@/lib/initial-data";
import { formatRupees, formatPhone } from "@/lib/format";
import { OrderRecord } from "@/lib/mock-db";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Bike,
  Store,
  CreditCard,
  Banknote,
  Receipt,
  X,
  User,
  Phone,
  Check,
  Percent,
} from "lucide-react";

interface PosLineItem {
  id: string;
  menuItemId: string;
  name: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  modifiers: { group: string; option: string; priceDelta: number }[];
}

export default function PosRegisterPage() {
  const [menuItems, setMenuItems] = useState<MenuItemSeed[]>(MENU_ITEMS_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>("pizzas");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeItemModal, setActiveItemModal] = useState<MenuItemSeed | null>(null);
  const [modalVariantIdx, setModalVariantIdx] = useState<number>(0);
  const [modalModifiers, setModalModifiers] = useState<{ group: string; option: string; priceDelta: number }[]>([]);
  const [modalQty, setModalQty] = useState<number>(1);

  useEffect(() => {
    async function loadPosMenu() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        if (data.success && data.data?.items) {
          setMenuItems(data.data.items);
        }
      } catch {
        // fallback to default
      }
    }
    loadPosMenu();
  }, []);

  // Active POS ticket state
  const [ticketItems, setTicketItems] = useState<PosLineItem[]>([]);
  const [posType, setPosType] = useState<"TAKEAWAY" | "DINE_IN" | "DELIVERY">("TAKEAWAY");
  const [tableOrToken, setTableOrToken] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountReason, setDiscountReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "JAZZCASH" | "EASYPAISA">("CASH");
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Success modal & print
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter menu items for POS grid
  const displayedItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (searchQuery.trim()) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return item.categorySlug === selectedCategory;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Customer phone lookup
  const handlePhoneLookup = async (phoneVal: string) => {
    setCustomerPhone(phoneVal);
    if (phoneVal.length >= 10) {
      try {
        const res = await fetch(`/api/customers/lookup?phone=${encodeURIComponent(phoneVal)}`);
        const data = await res.json();
        if (data.success && data.customer) {
          setCustomerName(data.customer.name);
          if (data.customer.lastAddress) {
            setDeliveryAddress(data.customer.lastAddress);
          }
        }
      } catch {
        // ignore lookup errors
      }
    }
  };

  // Calculations
  const subtotal = ticketItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const deliveryFee = posType === "DELIVERY" ? 100 : 0;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);
  const changeDue = Math.max(0, (cashTendered || 0) - total);

  // Add item helper
  const handleAddItem = (
    item: MenuItemSeed,
    variantIndex: number = 0,
    chosenModifiers: { group: string; option: string; priceDelta: number }[] = [],
    qty: number = 1
  ) => {
    const variant = item.variants[variantIndex] || item.variants[0];
    const modPrice = chosenModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
    const unitPrice = variant.price + modPrice;

    const modKey = chosenModifiers.map((m) => m.option).sort().join("|");
    const lineId = `${item.id}-${variant.name}-${modKey}`;

    setTicketItems((prev) => {
      const existing = prev.find((it) => it.id === lineId);
      if (existing) {
        return prev.map((it) => (it.id === lineId ? { ...it, quantity: it.quantity + qty } : it));
      }
      return [
        ...prev,
        {
          id: lineId,
          menuItemId: item.id,
          name: item.name,
          variantName: variant.name,
          unitPrice,
          quantity: qty,
          modifiers: chosenModifiers,
        },
      ];
    });

    setActiveItemModal(null);
  };

  const openItemModal = (item: MenuItemSeed) => {
    setModalVariantIdx(0);
    setModalQty(1);

    const initialMods: { group: string; option: string; priceDelta: number }[] = [];
    (item.modifierGroupNames || []).forEach((groupName) => {
      const group = MODIFIER_GROUPS_DATA.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
      if (group && group.minSelect === 1 && group.options.length > 0) {
        initialMods.push({
          group: group.name,
          option: group.options[0].name,
          priceDelta: group.options[0].priceDelta,
        });
      }
    });
    setModalModifiers(initialMods);
    setActiveItemModal(item);
  };

  const toggleModifierOption = (groupName: string, optionName: string, priceDelta: number, isSingleSelect: boolean) => {
    setModalModifiers((prev) => {
      if (isSingleSelect) {
        const filtered = prev.filter((m) => m.group !== groupName);
        return [...filtered, { group: groupName, option: optionName, priceDelta }];
      } else {
        const exists = prev.find((m) => m.group === groupName && m.option === optionName);
        if (exists) {
          return prev.filter((m) => !(m.group === groupName && m.option === optionName));
        } else {
          return [...prev, { group: groupName, option: optionName, priceDelta }];
        }
      }
    });
  };

  const updateQty = (id: string, delta: number) => {
    setTicketItems((prev) =>
      prev
        .map((it) => (it.id === id ? { ...it, quantity: it.quantity + delta } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const handleCheckoutPos = async () => {
    if (ticketItems.length === 0) return;
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "POS",
          type: posType,
          customerName: customerName.trim() || (posType === "DINE_IN" ? `Table ${tableOrToken || "1"}` : "Counter Customer"),
          customerPhone: customerPhone.trim() || "0300-0000000",
          address: posType === "DELIVERY" ? deliveryAddress : undefined,
          tableLabel: posType === "DINE_IN" ? tableOrToken || "Walk-in" : undefined,
          deliveryFee,
          discount: discountAmount,
          discountReason: discountReason || undefined,
          paymentMethod,
          items: ticketItems.map((it) => ({
            menuItemId: it.menuItemId,
            name: it.name,
            variantName: it.variantName,
            unitPrice: it.unitPrice,
            quantity: it.quantity,
            modifiers: it.modifiers,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLastOrder(data.order);
        // Clear ticket
        setTicketItems([]);
        setTableOrToken("");
        setDiscountAmount(0);
        setCashTendered(0);
        setCustomerName("");
        setCustomerPhone("");
        setDeliveryAddress("");
      }
    } catch (e) {
      console.error("POS order failed", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Menu / Food Picker Section */}
      <div className="flex-1 flex flex-col bg-charcoal rounded-2xl border border-stone-800 overflow-hidden">
        {/* Top Search & Category Bar */}
        <div className="p-3 bg-stone-900 border-b border-stone-800 space-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Quick search items (/ shortcut)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800 text-white placeholder-stone-400 pl-9 pr-4 py-2 rounded-xl text-xs border border-stone-700 focus:outline-hidden focus:border-amber"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES_DATA.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setSearchQuery("");
                  }}
                  className={`px-3 py-1.5 rounded-lg font-heading uppercase text-xs tracking-wider whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-amber text-charcoal font-bold shadow-xs"
                      : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Food Tiles Grid */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {displayedItems.map((item) => {
            const isSoldOut = item.isAvailable === false;
            const hasMultipleSizes = item.variants.length > 1;
            const hasModifiers = (item.modifierGroupNames || []).length > 0;
            const minPrice = Math.min(...item.variants.map((v) => v.price));

            return (
              <button
                key={item.id}
                disabled={isSoldOut}
                onClick={() => {
                  if (isSoldOut) return;
                  const hasMultipleSizes = item.variants.length > 1;
                  const hasModifiers = (item.modifierGroupNames || []).length > 0;
                  const hasDealItems = (item.dealComponents || []).length > 0;

                  if (hasMultipleSizes || hasModifiers || hasDealItems) {
                    openItemModal(item);
                  } else {
                    handleAddItem(item, 0, [], 1);
                  }
                }}
                className={`border rounded-xl p-2.5 text-left flex flex-col justify-between transition-all group ${
                  isSoldOut
                    ? "bg-stone-950/80 border-stone-800/50 opacity-60 cursor-not-allowed"
                    : "bg-stone-900 hover:bg-stone-800 active:scale-95 border-stone-800 hover:border-amber/80"
                }`}
              >
                <div>
                  <div className="relative h-24 w-full rounded-lg overflow-hidden mb-2 bg-stone-800">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className={`object-cover ${isSoldOut ? "grayscale-50" : "group-hover:scale-105 transition-transform"}`}
                      sizes="200px"
                    />
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-700 text-white font-heading uppercase text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-heading text-sm uppercase text-white leading-tight line-clamp-1">
                    {item.name}
                  </h4>
                  {hasMultipleSizes && (
                    <span className="text-[10px] text-stone-400 font-semibold block mt-0.5">
                      {item.variants.map((v) => v.name[0]).join(" / ")}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-stone-800/80 pt-1.5">
                  <span className="font-heading text-amber text-sm font-bold">
                    {formatRupees(minPrice)}
                  </span>
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                    isSoldOut
                      ? "bg-stone-800 text-stone-600"
                      : "bg-stone-800 text-stone-300 group-hover:bg-amber group-hover:text-charcoal"
                  }`}>
                    {isSoldOut ? "✕" : "+"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right POS Ticket Section */}
      <div className="w-full md:w-96 bg-charcoal rounded-2xl border border-stone-800 flex flex-col overflow-hidden">
        {/* Ticket Header & Type Switcher */}
        <div className="p-3 bg-stone-900 border-b border-stone-800 space-y-2.5">
          <div className="grid grid-cols-3 gap-1 bg-stone-800 p-1 rounded-xl text-xs font-heading uppercase font-bold">
            <button
              onClick={() => setPosType("TAKEAWAY")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                posType === "TAKEAWAY"
                  ? "bg-amber text-charcoal shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Takeaway
            </button>
            <button
              onClick={() => setPosType("DINE_IN")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                posType === "DINE_IN"
                  ? "bg-amber text-charcoal shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" /> Dine-In
            </button>
            <button
              onClick={() => setPosType("DELIVERY")}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                posType === "DELIVERY"
                  ? "bg-amber text-charcoal shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <Bike className="w-3.5 h-3.5" /> Phone Del.
            </button>
          </div>

          {/* Quick inputs for Dine-In Token / Phone */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {posType === "DINE_IN" ? (
              <input
                type="text"
                placeholder="Table / Token #"
                value={tableOrToken}
                onChange={(e) => setTableOrToken(e.target.value)}
                className="col-span-2 bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-amber"
              />
            ) : (
              <>
                <input
                  type="tel"
                  placeholder="Phone (0300...)"
                  value={customerPhone}
                  onChange={(e) => handlePhoneLookup(e.target.value)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-amber"
                />
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-stone-800 border border-stone-700 rounded-lg px-2.5 py-1.5 text-white placeholder-stone-500 focus:outline-hidden focus:border-amber"
                />
              </>
            )}
          </div>
        </div>

        {/* Ticket Line Items */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-stone-800/80">
          {ticketItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 text-xs py-10">
              <Receipt className="w-8 h-8 mb-2 opacity-50" />
              <span>Ticket is empty</span>
              <span className="text-[11px] text-stone-600 mt-1">Tap items on left to ring up</span>
            </div>
          ) : (
            ticketItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-start justify-between text-xs gap-2">
                <div className="flex-1">
                  <div className="font-bold text-white leading-tight">
                    {item.name}
                  </div>
                  {item.variantName && item.variantName !== "Regular" && (
                    <div className="text-amber text-[11px]">Size: {item.variantName}</div>
                  )}
                  {item.modifiers.map((m, i) => (
                    <div key={i} className="text-stone-400 text-[10px]">
                      • {m.option}
                    </div>
                  ))}

                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex items-center border border-stone-700 rounded-md bg-stone-900">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="px-1.5 py-0.5 hover:bg-stone-800 text-stone-300"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="px-1.5 py-0.5 hover:bg-stone-800 text-stone-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        setTicketItems((prev) => prev.filter((it) => it.id !== item.id))
                      }
                      className="text-stone-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="font-heading text-sm text-white font-bold">
                  {formatRupees(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Calculations & Payment Panel */}
        <div className="p-3 bg-stone-900 border-t border-stone-800 space-y-2 text-xs">
          <div className="flex justify-between text-stone-400">
            <span>Subtotal:</span>
            <span className="text-white font-semibold">{formatRupees(subtotal)}</span>
          </div>

          {posType === "DELIVERY" && (
            <div className="flex justify-between text-stone-400">
              <span>Delivery Fee:</span>
              <span className="text-white font-semibold">{formatRupees(deliveryFee)}</span>
            </div>
          )}

          {/* Discount Field */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-stone-400">Discount (Rs):</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={discountAmount || ""}
              onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
              className="w-20 bg-stone-800 border border-stone-700 text-right text-xs rounded px-2 py-0.5 text-white"
            />
          </div>

          <div className="flex justify-between font-heading text-base font-bold text-white border-t border-stone-800 pt-1.5">
            <span>Payable Total:</span>
            <span className="text-amber text-lg">{formatRupees(total)}</span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-4 gap-1 pt-1 text-[11px] font-heading uppercase font-bold">
            {(["CASH", "CARD", "JAZZCASH", "EASYPAISA"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-1.5 rounded-lg border text-center transition-all ${
                  paymentMethod === method
                    ? "bg-amber text-charcoal border-amber shadow-xs"
                    : "bg-stone-800 text-stone-400 border-stone-700 hover:text-white"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Cash Tendered Calculator (if Cash) */}
          {paymentMethod === "CASH" && (
            <div className="bg-stone-800/80 p-2 rounded-lg border border-stone-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Cash Received:</span>
                <input
                  type="number"
                  placeholder={String(total)}
                  value={cashTendered || ""}
                  onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                  className="w-24 bg-stone-900 border border-stone-600 rounded text-right px-2 py-0.5 font-mono text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">Change Due:</span>
                <span className="font-bold text-freshLime font-mono">{formatRupees(changeDue)}</span>
              </div>
            </div>
          )}

          {/* Ring Up & Print Button */}
          <button
            onClick={handleCheckoutPos}
            disabled={ticketItems.length === 0 || isSubmitting}
            className={`w-full py-3 rounded-xl font-heading text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
              ticketItems.length === 0 || isSubmitting
                ? "bg-stone-800 text-stone-600 cursor-not-allowed"
                : "bg-rimjhimRed hover:bg-rimjhimRed-dark text-white active:scale-98 font-bold"
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Pay & Print Receipt ({formatRupees(total)})</span>
          </button>
        </div>
      </div>

      {/* POS Item Option Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-charcoal border border-stone-700 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-white shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber/20 border border-amber/30 text-amber flex items-center justify-center font-heading text-lg">
                  🍕
                </div>
                <div>
                  <h3 className="font-heading text-lg sm:text-xl uppercase text-white leading-tight">
                    {activeItemModal.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                      {activeItemModal.categorySlug}
                    </span>
                    {activeItemModal.kind === "DEAL" && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rimjhimRed/20 text-rimjhimRed border border-rimjhimRed/30">
                        Deal Bundle
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveItemModal(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Deal bundle ingredients preview */}
              {activeItemModal.dealComponents && activeItemModal.dealComponents.length > 0 && (
                <div className="bg-stone-900/90 border border-amber/30 p-3 rounded-2xl space-y-1.5">
                  <span className="text-[11px] font-heading uppercase text-amber tracking-wider font-bold block">
                    🎁 Bundle Includes:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-300">
                    {activeItemModal.dealComponents.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-stone-800/60 px-2.5 py-1.5 rounded-xl border border-stone-700/50">
                        <Check className="w-3.5 h-3.5 text-freshLime shrink-0" />
                        <span className="font-medium text-white">{comp.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes / Portion Selection */}
              <div>
                <label className="text-xs font-heading uppercase tracking-wider text-stone-300 block mb-2 font-bold">
                  {activeItemModal.variants.length > 1 ? "1. Choose Size / Variant:" : "Portion / Base Price:"}
                </label>
                {activeItemModal.variants.length > 1 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activeItemModal.variants.map((v, i) => {
                      const isSelected = modalVariantIdx === i;
                      return (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() => setModalVariantIdx(i)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? "bg-amber text-charcoal border-amber shadow-md font-bold scale-[1.02]"
                              : "bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800 hover:border-stone-700"
                          }`}
                        >
                          <div className="font-heading uppercase text-sm leading-tight">{v.name}</div>
                          <div className={`text-xs mt-1 font-mono font-bold ${isSelected ? "text-charcoal" : "text-amber"}`}>
                            {formatRupees(v.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-stone-900 border border-stone-800 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-heading uppercase text-sm text-white font-bold">
                        {activeItemModal.variants[0]?.name || "Standard Single"}
                      </span>
                      {activeItemModal.description && (
                        <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{activeItemModal.description}</p>
                      )}
                    </div>
                    <span className="font-heading text-amber text-base font-bold font-mono">
                      {formatRupees(activeItemModal.variants[0]?.price || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Modifier Groups (Choose Drink, Choose Flavour, Add Extras) */}
              {(activeItemModal.modifierGroupNames || []).map((groupName) => {
                const group = MODIFIER_GROUPS_DATA.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
                if (!group) return null;
                const isSingleSelect = group.maxSelect === 1;

                return (
                  <div key={group.name} className="space-y-2 pt-1 border-t border-stone-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-heading uppercase tracking-wider text-stone-300 font-bold">
                        {group.name}
                      </label>
                      <span className="text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded-full border border-stone-800">
                        {isSingleSelect ? "Select 1" : `Up to ${group.maxSelect}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {group.options.map((opt) => {
                        const isChosen = modalModifiers.some(
                          (m) => m.group === group.name && m.option === opt.name
                        );

                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() =>
                              toggleModifierOption(group.name, opt.name, opt.priceDelta, isSingleSelect)
                            }
                            className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                              isChosen
                                ? "bg-amber/20 border-amber text-amber font-bold"
                                : "bg-stone-900 hover:bg-stone-800 border-stone-800 text-stone-300"
                            }`}
                          >
                            <span className="truncate pr-1">{opt.name}</span>
                            {opt.priceDelta > 0 && (
                              <span className="text-[10px] text-freshLime font-mono shrink-0">
                                +{opt.priceDelta}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer: Qty + Total + Add Button */}
            <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-900 flex items-center gap-3 shrink-0">
              {/* Quantity counter */}
              <div className="flex items-center bg-stone-800 border border-stone-700 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-heading text-sm font-bold text-white">
                  {modalQty}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQty((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center text-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Ticket Button */}
              {(() => {
                const variantPrice =
                  activeItemModal.variants[modalVariantIdx]?.price ||
                  activeItemModal.variants[0]?.price ||
                  0;
                const modTotal = modalModifiers.reduce((sum, m) => sum + m.priceDelta, 0);
                const itemTotal = (variantPrice + modTotal) * modalQty;

                return (
                  <button
                    type="button"
                    onClick={() => {
                      handleAddItem(activeItemModal, modalVariantIdx, modalModifiers, modalQty);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-sm font-bold flex items-center justify-between shadow-lg transition-all active:scale-98"
                  >
                    <span>Add to Ticket</span>
                    <span className="font-mono text-base">{formatRupees(itemTotal)}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Print Confirmation Modal */}
      {lastOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-charcoal border border-stone-700 rounded-3xl max-w-sm w-full p-6 text-white text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <div>
              <h3 className="font-heading text-2xl uppercase">Order #{lastOrder.orderNo}</h3>
              <p className="text-xs text-stone-400 mt-1">
                Sale registered successfully ({lastOrder.paymentMethod} • {formatRupees(lastOrder.total)})
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  setLastOrder(null);
                }}
                className="flex-1 bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-sm py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
              <button
                onClick={() => setLastOrder(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-heading uppercase text-sm rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
