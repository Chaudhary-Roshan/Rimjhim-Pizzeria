"use client";

import Image from "next/image";
import { Plus, Flame, Star, Sparkles, Ban } from "lucide-react";
import { MenuItemSeed } from "@/lib/initial-data";
import { formatRupees } from "@/lib/format";

interface ItemCardProps {
  item: MenuItemSeed;
  onSelect: (item: MenuItemSeed) => void;
}

export function ItemCard({ item, onSelect }: ItemCardProps) {
  const isSoldOut = item.isAvailable === false;
  const minPrice = Math.min(...item.variants.map((v) => v.price));
  const hasMultipleSizes = item.variants.length > 1;

  return (
    <div
      onClick={() => {
        if (!isSoldOut) onSelect(item);
      }}
      className={`group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-xs transition-all duration-200 flex flex-col justify-between ${
        isSoldOut
          ? "opacity-75 cursor-not-allowed bg-stone-50"
          : "hover:shadow-card hover:-translate-y-1 cursor-pointer"
      }`}
    >
      {/* Top Media */}
      <div>
        <div className="relative h-44 sm:h-48 w-full bg-stone-100 overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              isSoldOut ? "grayscale-50" : "group-hover:scale-105"
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Sold Out Overlay Banner */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="bg-red-600 text-white font-heading uppercase text-xs font-bold tracking-widest px-3 py-1 rounded-full shadow-lg border border-red-400 flex items-center gap-1.5">
                <Ban className="w-3.5 h-3.5" /> Sold Out
              </span>
            </div>
          )}

          {/* Floating Badges */}
          {!isSoldOut && (
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
              {item.tags.includes("bestseller") && (
                <span className="bg-amber text-charcoal font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-current" /> Bestseller
                </span>
              )}
              {item.tags.includes("spicy") && (
                <span className="bg-rimjhimRed text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Flame className="w-2.5 h-2.5 fill-current" /> Spicy
                </span>
              )}
              {item.isDealOfDay && (
                <span className="bg-dealOrange text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 fill-current" /> Deal of the Day
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className={`font-heading text-xl uppercase leading-tight transition-colors ${
              isSoldOut
                ? "text-stone-500"
                : "text-stone-900 group-hover:text-rimjhimRed"
            }`}
          >
            {item.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer / Price & Add */}
      <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-stone-100">
        <div>
          <span className="text-[11px] text-stone-400 block font-medium">
            {hasMultipleSizes ? "Starting from" : "Price"}
          </span>
          <div className="font-heading text-lg text-stone-900 font-bold leading-none">
            {formatRupees(minPrice)}
          </div>
        </div>

        <button
          type="button"
          disabled={isSoldOut}
          onClick={(e) => {
            e.stopPropagation();
            if (!isSoldOut) onSelect(item);
          }}
          className={`p-2.5 rounded-xl font-semibold text-xs flex items-center gap-1 transition-all ${
            isSoldOut
              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
              : "bg-rimjhimRed hover:bg-rimjhimRed-dark text-white shadow-md group-hover:scale-105 active:scale-95"
          }`}
        >
          {isSoldOut ? (
            <span>Sold Out</span>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
