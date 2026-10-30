"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { ItemCard } from "@/components/menu/ItemCard";
import { ItemModal } from "@/components/menu/ItemModal";
import {
  CATEGORIES_DATA,
  MENU_ITEMS_DATA,
  MenuItemSeed,
} from "@/lib/initial-data";
import {
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Flame,
  ShieldCheck,
  Bike,
  UtensilsCrossed,
} from "lucide-react";

export default function HomePage() {
  const [items, setItems] = useState<MenuItemSeed[]>(MENU_ITEMS_DATA);
  const [selectedItem, setSelectedItem] = useState<MenuItemSeed | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        if (data.success && data.data?.items) {
          setItems(data.data.items);
        }
      } catch {
        // use default
      }
    }
    loadMenu();
  }, []);

  const bestSellers = items.filter((i) => i.tags.includes("bestseller")).slice(0, 8);
  const dealOfTheDay = items.find((i) => i.isDealOfDay) || items.find((i) => i.kind === "DEAL");

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-charcoal text-white overflow-hidden py-12 md:py-20 px-4 sm:px-6">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rimjhimRed/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-stone-800/90 border border-stone-700/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber shadow-sm">
              <span className="w-2 h-2 rounded-full bg-freshLime animate-pulse" />
              <span>Commercial Area, Satellite Town, Bahawalpur</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight text-white leading-none">
              Bahawalpur&apos;s <br />
              <span className="text-amber">Cheesy & Crispy</span> <br />
              Food Obsession
            </h1>

            <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Order fresh stone-baked Crown Crust pizzas, signature Zinger & Tower burgers, loaded shawarma platters, and unbeatable family bundles right to your door.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/menu"
                className="w-full sm:w-auto bg-rimjhimRed hover:bg-rimjhimRed-dark text-white px-8 py-4 rounded-2xl font-heading text-xl uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/923086547672?text=Hello%20Rimjhim%20Pizzeria!%20I%20would%20like%20to%20order."
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 px-6 py-4 rounded-2xl font-heading text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <span>WhatsApp Order</span>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-800/80 text-center lg:text-left">
              <div>
                <div className="font-heading text-2xl text-amber">30-45 MIN</div>
                <div className="text-xs text-stone-400">Fast Hot Delivery</div>
              </div>
              <div>
                <div className="font-heading text-2xl text-amber">100% FRESH</div>
                <div className="text-xs text-stone-400">Pure Dairy Cheese</div>
              </div>
              <div>
                <div className="font-heading text-2xl text-amber">RS 150+</div>
                <div className="text-xs text-stone-400">Affordable Bites</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-72 sm:w-96 h-72 sm:h-96">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber/30 animate-[spin_60s_linear_infinite]" />
              <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-amber/60">
                <Image
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80"
                  alt="Rimjhim Specialty Pizza"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Promo Tag */}
              <div className="absolute -bottom-2 -left-2 bg-dealOrange text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 font-heading uppercase text-sm sm:text-base border-2 border-white">
                <Flame className="w-5 h-5 text-amber fill-current" />
                <span>Stone-Baked Hot</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deal of the Day Banner */}
      {dealOfTheDay && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-20">
          <div
            onClick={() => setSelectedItem(dealOfTheDay)}
            className="group cursor-pointer bg-gradient-to-r from-dealOrange via-red-600 to-rimjhimRed rounded-3xl p-6 md:p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:scale-[1.01] transition-transform"
          >
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-amber text-charcoal font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Deal of the Day
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl uppercase tracking-wide">
                {dealOfTheDay.name}
              </h2>
              <p className="text-white/90 text-sm max-w-xl">
                {dealOfTheDay.description}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs uppercase tracking-wider text-amber-200 block font-semibold">
                  Special Price
                </span>
                <span className="font-heading text-3xl sm:text-4xl font-bold">
                  Rs {dealOfTheDay.variants[0].price}
                </span>
              </div>
              <button
                type="button"
                className="bg-white text-rimjhimRed font-heading text-lg uppercase tracking-wider px-6 py-3 rounded-2xl shadow-md group-hover:bg-amber group-hover:text-charcoal transition-colors"
              >
                Claim Deal
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl text-stone-900 uppercase">
              Explore Our Menu
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Browse by favorite food categories
            </p>
          </div>
          <Link
            href="/menu"
            className="text-rimjhimRed hover:text-rimjhimRed-dark font-semibold text-xs sm:text-sm flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
          {CATEGORIES_DATA.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="group bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md hover:border-amber transition-all flex flex-col items-center text-center"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 bg-stone-100 group-hover:scale-105 transition-transform">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <span className="font-heading text-xs sm:text-sm uppercase text-stone-800 group-hover:text-rimjhimRed transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestseller Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rimjhimRed uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 fill-current" /> Customer Favorites
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl text-stone-900 uppercase">
            Top Selling Dishes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((item) => (
            <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
          ))}
        </div>
      </section>

      {/* Why Choose Rimjhim Section */}
      <section className="bg-stone-100 border-y border-stone-200 py-12 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber/20 text-amber-800 flex items-center justify-center shrink-0">
              <Bike className="w-6 h-6 text-amber" />
            </div>
            <div>
              <h3 className="font-heading text-xl uppercase text-stone-900">
                Satellite Town Delivery
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Hot and fresh delivery across Bahawalpur including Model Town, Cheema Town, and Cantt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-rimjhimRed flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-rimjhimRed" />
            </div>
            <div>
              <h3 className="font-heading text-xl uppercase text-stone-900">
                100% Quality Ingredients
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Hand-kneaded dough, pure mozzarella cheese, and fresh seasoned chicken daily.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-freshLime-dark flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-heading text-xl uppercase text-stone-900">
                Instant WhatsApp Confirmation
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Receive instant order confirmation and live status updates directly on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-stone-300 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="font-heading text-2xl uppercase text-white tracking-wider">
              Rimjhim <span className="text-amber">Pizzeria</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Serving the crispiest burgers, loaded shawarmas, and tastiest pizzas in Satellite Town, Bahawalpur.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-lg uppercase text-white mb-3">Timings</h4>
            <div className="text-xs space-y-1.5 text-stone-400">
              <p className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber" /> Monday – Sunday: 12:00 PM – 03:00 AM
              </p>
              <p className="text-freshLime font-semibold">Open 7 days a week</p>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg uppercase text-white mb-3">Location & Orders</h4>
            <div className="text-xs space-y-1.5 text-stone-400">
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber" /> Commercial Area, Satellite Town, Bahawalpur
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber" /> 0308-6547672 / 0315-7074274
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-stone-800 mt-8 pt-6 text-center text-xs text-stone-500 space-y-2">
          <div>
            © {new Date().getFullYear()} Rimjhim Pizzeria. All rights reserved. Commercial Area, Satellite Town, Bahawalpur.
          </div>
          <div className="text-[11px] text-stone-400">
            This website is developed by <strong className="text-amber font-semibold">Muhammad Roshan Ashraf</strong> •{" "}
            <a
              href="tel:03037357002"
              className="text-stone-300 hover:text-amber font-mono font-medium underline underline-offset-2 transition-colors"
            >
              0303-7357002
            </a>
          </div>
        </div>
      </footer>

      {/* Item Modal */}
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
