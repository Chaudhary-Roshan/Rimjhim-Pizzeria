"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Phone, MapPin, Clock } from "lucide-react";
import { useCartStore } from "@/lib/store";

export function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { toggleCart, getTotalCount, initStore } = useCartStore();

  useEffect(() => {
    initStore();
    setMounted(true);
  }, [initStore]);

  const totalCount = mounted ? getTotalCount() : 0;

  const isPortal = pathname.startsWith("/owner") || pathname.startsWith("/admin");
  if (isPortal) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-charcoal text-white border-b border-stone-800 shadow-md">
      {/* Top Banner Notice */}
      <div className="bg-rimjhimRed px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Open Daily: 12:00 PM – 03:00 AM
        </span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> Satellite Town, Bahawalpur
        </span>
        <span className="hidden md:inline">|</span>
        <a
          href="tel:03086547672"
          className="hidden md:flex items-center gap-1 underline font-semibold hover:text-amber-200"
        >
          <Phone className="w-3 h-3" /> 0308-6547672
        </a>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-full bg-rimjhimRed flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
            🍕
          </div>
          <div>
            <div className="font-heading text-2xl tracking-wider text-white uppercase leading-none">
              Rimjhim <span className="text-amber">Pizzeria</span>
            </div>
            <div className="text-[10px] text-stone-400 font-medium tracking-widest uppercase">
              Bahawalpur
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link
            href="/"
            className={`transition-colors hover:text-amber ${
              pathname === "/" ? "text-amber font-semibold" : "text-stone-300"
            }`}
          >
            Home
          </Link>
          <Link
            href="/menu"
            className={`transition-colors hover:text-amber ${
              pathname.startsWith("/menu") ? "text-amber font-semibold" : "text-stone-300"
            }`}
          >
            Full Menu
          </Link>
          <Link
            href="/my-orders"
            className={`transition-colors hover:text-amber ${
              pathname === "/my-orders" ? "text-amber font-semibold" : "text-stone-300"
            }`}
          >
            Track Order
          </Link>
        </nav>

        {/* Right CTA / Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden lg:inline-flex text-xs text-stone-400 hover:text-white px-3 py-1.5 rounded-xl border border-stone-800 hover:border-stone-700 transition-colors"
          >
            Staff Sign In
          </Link>

          <button
            onClick={() => toggleCart(true)}
            className="relative flex items-center gap-2 bg-rimjhimRed hover:bg-rimjhimRed-dark text-white px-4 py-2 rounded-full font-medium text-sm transition-all shadow-md active:scale-95"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Cart</span>
            {mounted && totalCount > 0 && (
              <span className="bg-amber text-charcoal font-bold text-xs px-2 py-0.5 rounded-full animate-bounce">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
