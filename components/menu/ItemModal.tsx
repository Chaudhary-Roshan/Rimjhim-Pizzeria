"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { X, Plus, Minus, Check, Flame, Star, Sparkles } from "lucide-react";
import { MenuItemSeed, MODIFIER_GROUPS_DATA } from "@/lib/initial-data";
import { useCartStore, CartModifier } from "@/lib/store";
import { formatRupees } from "@/lib/format";

interface ItemModalProps {
  item: MenuItemSeed | null;
  onClose: () => void;
}

interface ItemModalDialogProps {
  item: MenuItemSeed;
  onClose: () => void;
}

function ItemModalDialog({ item, onClose }: ItemModalDialogProps) {
  const { addItem } = useCartStore();

  // Active selected variant (default to first variant, e.g. Small or Regular)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState("");

  // Modifiers selections state: groupName -> array of selected options
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    if (item.modifierGroupNames) {
      for (const groupName of item.modifierGroupNames) {
        const group = MODIFIER_GROUPS_DATA.find((g) => g.name === groupName);
        if (group && group.minSelect > 0 && group.options.length > 0) {
          // pre-select first option for required groups (like Choose Drink or Flavor)
          initial[groupName] = [group.options[0].name];
        } else {
          initial[groupName] = [];
        }
      }
    }
    return initial;
  });

  const currentVariant = item.variants[selectedVariantIndex] || item.variants[0];

  // Calculate live item price: variant price + active modifier price deltas
  const unitPrice = useMemo(() => {
    let price = currentVariant.price;
    for (const [groupName, optionNames] of Object.entries(selectedModifiers)) {
      const group = MODIFIER_GROUPS_DATA.find((g) => g.name === groupName);
      if (!group) continue;
      for (const optName of optionNames) {
        const opt = group.options.find((o) => o.name === optName);
        if (opt) {
          price += opt.priceDelta;
        }
      }
    }
    return price;
  }, [currentVariant, selectedModifiers]);

  const liveTotal = unitPrice * quantity;

  const handleModifierToggle = (groupName: string, optionName: string, maxSelect: number) => {
    setSelectedModifiers((prev) => {
      const currentList = prev[groupName] || [];
      const isSelected = currentList.includes(optionName);

      if (maxSelect === 1) {
        // Single select (radio behavior)
        return { ...prev, [groupName]: [optionName] };
      } else {
        // Multi-select (checkbox behavior)
        if (isSelected) {
          return {
            ...prev,
            [groupName]: currentList.filter((name) => name !== optionName),
          };
        } else {
          if (currentList.length < maxSelect) {
            return {
              ...prev,
              [groupName]: [...currentList, optionName],
            };
          }
          return prev;
        }
      }
    });
  };

  const handleAddToCart = () => {
    // Flatten selected modifiers for cart record
    const flatModifiers: CartModifier[] = [];
    for (const [groupName, optionNames] of Object.entries(selectedModifiers)) {
      const group = MODIFIER_GROUPS_DATA.find((g) => g.name === groupName);
      if (!group) continue;
      for (const optName of optionNames) {
        const opt = group.options.find((o) => o.name === optName);
        if (opt) {
          flatModifiers.push({
            group: groupName,
            option: opt.name,
            priceDelta: opt.priceDelta,
          });
        }
      }
    }

    addItem({
      menuItemId: item.id,
      name: item.name,
      variantName: currentVariant.name,
      unitPrice,
      quantity,
      imageUrl: item.imageUrl,
      modifiers: flatModifiers,
      note: specialNote.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Photo Header */}
          <div className="relative h-56 sm:h-64 w-full bg-charcoal">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
              {item.tags.includes("bestseller") && (
                <span className="bg-amber text-charcoal font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-current" /> Bestseller
                </span>
              )}
              {item.tags.includes("spicy") && (
                <span className="bg-rimjhimRed text-white font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Flame className="w-3 h-3 fill-current" /> Spicy
                </span>
              )}
              {item.isDealOfDay && (
                <span className="bg-dealOrange text-white font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 fill-current" /> Deal of the Day
                </span>
              )}
            </div>

            {/* Item Title in Image */}
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <h3 className="font-heading text-3xl tracking-wide uppercase leading-tight drop-shadow-sm">
                {item.name}
              </h3>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>

            {/* Deal Components list if applicable */}
            {item.dealComponents && item.dealComponents.length > 0 && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
                <span className="font-heading text-xs uppercase tracking-wider text-stone-500 font-bold block">
                  Deal Includes:
                </span>
                <ul className="text-xs text-stone-700 space-y-1">
                  {item.dealComponents.map((comp, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-amber font-bold">✓</span>
                      <span>{comp.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size Variants (if more than 1 variant) */}
            {item.variants.length > 1 && (
              <div>
                <label className="font-heading text-sm uppercase tracking-wider text-stone-800 font-bold block mb-2.5">
                  Choose Size <span className="text-rimjhimRed">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {item.variants.map((v, i) => {
                    const isSelected = selectedVariantIndex === i;
                    return (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setSelectedVariantIndex(i)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "border-rimjhimRed bg-red-50 text-rimjhimRed ring-2 ring-rimjhimRed shadow-xs"
                            : "border-stone-200 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        <div className="font-bold text-sm">{v.name}</div>
                        <div className="text-xs font-semibold mt-0.5 text-stone-900">
                          {formatRupees(v.price)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modifiers (Drinks, Flavors, Extras) */}
            {item.modifierGroupNames?.map((groupName) => {
              const group = MODIFIER_GROUPS_DATA.find((g) => g.name === groupName);
              if (!group) return null;
              const isRequired = group.minSelect > 0;
              const activeChoices = selectedModifiers[groupName] || [];

              return (
                <div key={groupName} className="border-t border-stone-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-heading text-sm uppercase tracking-wider text-stone-800 font-bold">
                      {group.name}
                      {isRequired && <span className="text-rimjhimRed ml-1">*</span>}
                    </label>
                    <span className="text-xs text-stone-500">
                      {group.maxSelect === 1 ? "Select 1" : `Up to ${group.maxSelect}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((opt) => {
                      const isChecked = activeChoices.includes(opt.name);
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => handleModifierToggle(groupName, opt.name, group.maxSelect)}
                          className={`p-2.5 rounded-lg border text-left text-xs font-medium flex items-center justify-between transition-all ${
                            isChecked
                              ? "border-amber bg-amber-50/60 text-stone-900 font-semibold ring-1 ring-amber"
                              : "border-stone-200 hover:border-stone-300 text-stone-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border text-[10px] ${
                                isChecked
                                  ? "bg-amber border-amber text-charcoal font-bold"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {isChecked && <Check className="w-2.5 h-2.5" />}
                            </div>
                            <span>{opt.name}</span>
                          </div>
                          {opt.priceDelta > 0 && (
                            <span className="text-[11px] text-stone-500 font-semibold">
                              +{formatRupees(opt.priceDelta)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Special Instructions */}
            <div className="border-t border-stone-100 pt-4">
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Special Instructions (optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Extra spicy, less mayo, cutlery needed..."
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber"
              />
            </div>
          </div>

          {/* Modal Footer / Add Button */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-sm min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              disabled={item.isAvailable === false}
              onClick={handleAddToCart}
              className={`flex-1 py-3.5 px-4 rounded-xl font-heading text-lg uppercase tracking-wider flex items-center justify-between shadow-lg transition-all ${
                item.isAvailable === false
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-rimjhimRed hover:bg-rimjhimRed-dark text-white active:scale-98"
              }`}
            >
              <span>{item.isAvailable === false ? "Currently Sold Out" : "Add to Order"}</span>
              <span>{formatRupees(liveTotal)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ItemModal({ item, onClose }: ItemModalProps) {
  if (!item) return null;
  return <ItemModalDialog key={item.id} item={item} onClose={onClose} />;
}
