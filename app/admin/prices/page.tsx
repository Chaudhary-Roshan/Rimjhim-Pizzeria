"use client";

import { useState, useEffect } from "react";
import { formatRupees } from "@/lib/format";
import {
  Percent,
  ArrowRight,
  Check,
  RefreshCw,
  Loader2,
  TrendingUp,
  Tag,
  DollarSign,
  AlertCircle,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  categorySlug?: string;
  variants: { name: string; price: number }[];
}

export default function AdminBulkPricesPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [percentageIncrease, setPercentageIncrease] = useState<number>(5);
  const [roundToTen, setRoundToTen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      const list = data.data?.items || data.items || [];
      if (list.length > 0) {
        setItems(list);
      }
    } catch (err) {
      console.error("Failed to fetch menu items", err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const calculateNewPrice = (oldPrice: number) => {
    let newPrice = oldPrice * (1 + percentageIncrease / 100);
    if (roundToTen) {
      newPrice = Math.round(newPrice / 10) * 10;
    } else {
      newPrice = Math.round(newPrice);
    }
    return Math.max(10, newPrice);
  };

  const handleApply = async () => {
    if (!confirm(`Apply a ${percentageIncrease >= 0 ? "+" : ""}${percentageIncrease}% price adjustment across all menu items?`)) {
      return;
    }

    setSaving(true);
    setSuccessMessage("");

    try {
      const res = await fetch("/api/menu/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          percentage: percentageIncrease,
          roundToTen,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(`Prices updated successfully by ${percentageIncrease}% across the entire menu!`);
        setPreviewMode(false);
        fetchItems();
      } else {
        alert(data.message || "Failed to update prices");
      }
    } catch {
      alert("Failed to connect to server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const categories = Array.from(
    new Set(items.map((i) => i.categorySlug).filter((c): c is string => Boolean(c)))
  );
  const filteredItems =
    selectedCategory === "ALL"
      ? items
      : items.filter((i) => i.categorySlug === selectedCategory);

  // Total variants count
  const totalVariantsCount = items.reduce((acc, it) => acc + it.variants.length, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
              Bulk Price Adjuster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber/20 text-amber border border-amber/30">
              {totalVariantsCount} Price Points
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Apply percentage inflation or seasonal adjustments across pizzas, deals, and sides with instant simulation preview.
          </p>
        </div>

        <button
          onClick={fetchItems}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Control Box */}
      <div className="bg-charcoal p-6 rounded-2xl border border-stone-800 space-y-5 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end text-xs">
          {/* Percentage */}
          <div className="space-y-1.5">
            <label className="text-stone-300 font-semibold block">
              Adjustment Percentage (%):
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                value={percentageIncrease}
                onChange={(e) => setPercentageIncrease(Number(e.target.value) || 0)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono text-sm focus:outline-hidden focus:border-amber"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 pt-1">
              {[-10, -5, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPercentageIncrease(pct)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${percentageIncrease === pct
                    ? "bg-amber text-charcoal"
                    : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                    }`}
                >
                  {pct > 0 ? `+${pct}%` : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Rounding Rule */}
          <div className="space-y-1.5">
            <label className="text-stone-300 font-semibold block">Price Rounding Rule:</label>
            <button
              type="button"
              onClick={() => setRoundToTen(!roundToTen)}
              className={`w-full p-2.5 rounded-xl border text-center font-semibold transition-colors flex items-center justify-center gap-1.5 ${roundToTen
                ? "bg-amber/20 border-amber text-amber font-bold"
                : "bg-stone-900 border-stone-700 text-stone-300"
                }`}
            >
              <span>{roundToTen ? "✓ Round to Nearest Rs 10" : "Exact Rupee"}</span>
            </button>
            <div className="text-[10px] text-stone-500">
              {roundToTen ? "e.g. Rs 1,023 becomes Rs 1,020" : "Keeps whole unrounded numbers"}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex-1 font-heading uppercase text-xs py-3 rounded-xl border font-bold transition-colors flex items-center justify-center gap-1.5 ${previewMode
                ? "bg-stone-800 border-stone-700 text-white"
                : "bg-amber hover:bg-amber/90 border-transparent text-charcoal shadow-md"
                }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{previewMode ? "Hide Preview" : "Simulate Preview"}</span>
            </button>
          </div>
        </div>

        {/* Warning Note */}
        <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <span>
            Applying price adjustments updates all variants across the customer storefront and staff POS counter simultaneously. Always review the preview below before confirming.
          </span>
        </div>
      </div>

      {/* Preview Section */}
      {previewMode && (
        <div className="bg-charcoal rounded-2xl border border-stone-800 overflow-hidden shadow-xl space-y-0">
          <div className="p-4 bg-stone-900 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-heading uppercase text-sm text-amber font-bold">
                Simulation Preview ({percentageIncrease >= 0 ? `+${percentageIncrease}%` : `${percentageIncrease}%`})
              </span>
              <span className="text-xs text-stone-400">
                ({filteredItems.length} items shown)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden capitalize"
              >
                <option key="ALL" value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>

              <button
                disabled={saving}
                onClick={handleApply}
                className="bg-rimjhimRed hover:bg-rimjhimRed-dark text-white font-heading uppercase text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-transform active:scale-95"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Confirm & Apply Changes</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900 border-b border-stone-800 font-heading uppercase text-stone-400 text-[11px] sticky top-0 z-10">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Menu Item</th>
                  <th className="p-3">Variant</th>
                  <th className="p-3">Current Price</th>
                  <th className="p-3">Simulated Price</th>
                  <th className="p-3">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80 font-mono">
                {filteredItems.flatMap((item) =>
                  item.variants.map((v) => {
                    const newPrice = calculateNewPrice(v.price);
                    const diff = newPrice - v.price;
                    return (
                      <tr key={`${item.id}-${v.name}`} className="hover:bg-stone-800/30 transition-colors">
                        <td className="p-3 font-sans text-stone-400 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 uppercase font-mono text-[10px]">
                            {item.categorySlug || "General"}
                          </span>
                        </td>
                        <td className="p-3 font-sans font-bold text-white">{item.name}</td>
                        <td className="p-3 font-sans text-stone-300">{v.name}</td>
                        <td className="p-3 text-stone-400">{formatRupees(v.price)}</td>
                        <td className="p-3 font-bold text-amber">{formatRupees(newPrice)}</td>
                        <td className="p-3 font-semibold">
                          {diff >= 0 ? (
                            <span className="text-emerald-400">+{formatRupees(diff)}</span>
                          ) : (
                            <span className="text-rimjhimRed">{formatRupees(diff)}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
