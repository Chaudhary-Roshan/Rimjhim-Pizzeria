"use client";

import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ItemCard } from "@/components/menu/ItemCard";
import { ItemModal } from "@/components/menu/ItemModal";
import {
  CATEGORIES_DATA,
  MENU_ITEMS_DATA,
  MenuItemSeed,
} from "@/lib/initial-data";
import { Search, SlidersHorizontal, Flame, Sparkles } from "lucide-react";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItemSeed[]>(MENU_ITEMS_DATA);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MenuItemSeed | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLiveMenu() {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        if (data.success && data.data?.items) {
          setItems(data.data.items);
        }
      } catch {
        // fallback to default
      }
    }
    fetchLiveMenu();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.categorySlug !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (filterTag && !item.tags.includes(filterTag)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }
      return true;
    });
  }, [selectedCategory, filterTag, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar />

      {/* Menu Header & Search Bar */}
      <section className="bg-charcoal text-white pt-8 pb-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight">
                Our Full Menu
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                Authentic flavors, whole-rupee prices, prepared fresh to order.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search pizzas, burgers, deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-800 text-white placeholder-stone-400 pl-10 pr-4 py-2.5 rounded-xl border border-stone-700 text-sm focus:outline-hidden focus:border-amber focus:ring-1 focus:ring-amber"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-stone-400 font-semibold uppercase tracking-wider flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
            </span>
            <button
              onClick={() => setFilterTag(null)}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
                filterTag === null
                  ? "bg-amber text-charcoal font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterTag(filterTag === "bestseller" ? null : "bestseller")}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1 ${
                filterTag === "bestseller"
                  ? "bg-amber text-charcoal font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              <Sparkles className="w-3 h-3" /> Bestsellers
            </button>
            <button
              onClick={() => setFilterTag(filterTag === "spicy" ? null : "spicy")}
              className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 flex items-center gap-1 ${
                filterTag === "spicy"
                  ? "bg-rimjhimRed text-white font-bold"
                  : "bg-stone-800 text-stone-300 hover:bg-stone-700"
              }`}
            >
              <Flame className="w-3 h-3" /> Spicy
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Category Bar */}
      <nav className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`font-heading text-sm uppercase px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-charcoal text-white font-bold shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Items ({MENU_ITEMS_DATA.length})
            </button>

            {CATEGORIES_DATA.map((cat) => {
              const count = MENU_ITEMS_DATA.filter((i) => i.categorySlug === cat.slug).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`font-heading text-sm uppercase px-4 py-1.5 rounded-full whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-rimjhimRed text-white font-bold shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Items Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-stone-500">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-heading text-2xl text-stone-800">No items found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Try searching for a different keyword or select another category above.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setFilterTag(null);
              }}
              className="mt-4 text-xs font-semibold text-rimjhimRed underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
            ))}
          </div>
        )}
      </main>

      {/* Item Modal */}
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
