"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatRupees } from "@/lib/format";

export function FloatingCartBar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { getTotalCount, getTotal, toggleCart, items } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCount = mounted ? getTotalCount() : 0;
  const total = mounted ? getTotal() : 0;

  // Hide on checkout, track order, owner, login, and admin panels
  const isHiddenPage =
    !mounted ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order") ||
    pathname.startsWith("/track") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login");

  if (isHiddenPage || totalCount === 0 || items.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 md:hidden animate-in slide-in-from-bottom duration-300">
      <button
        onClick={() => toggleCart(true)}
        className="w-full bg-rimjhimRed text-white py-3 px-4 rounded-2xl shadow-floating flex items-center justify-between font-medium active:scale-98 transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative bg-black/20 p-2 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-amber text-charcoal font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center">
              {totalCount}
            </span>
          </div>
          <div className="text-left">
            <div className="text-xs text-amber font-semibold uppercase tracking-wider">
              {totalCount} {totalCount === 1 ? "item" : "items"} added
            </div>
            <div className="font-heading text-lg leading-none tracking-wide">
              {formatRupees(total)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 font-heading text-base uppercase tracking-wider text-amber font-bold">
          <span>View Cart</span>
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </button>
    </div>
  );
}
