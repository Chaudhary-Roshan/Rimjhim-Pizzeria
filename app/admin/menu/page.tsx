"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CATEGORIES_DATA, MenuItemSeed } from "@/lib/initial-data";
import { formatRupees } from "@/lib/format";
import {
  Search,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  Flame,
  Star,
  Sparkles,
  Loader2,
  UtensilsCrossed,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const IMAGE_PRESETS = [
  { label: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
  { label: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
  { label: "Deal Bundle", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80" },
  { label: "Wings / Sides", url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80" },
  { label: "Shawarma", url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80" },
  { label: "Pasta", url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80" },
  { label: "Beverage", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80" },
];

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItemSeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal state: "add" | "edit" | null
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemSeed | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCat, setFormCat] = useState("pizzas");
  const [formKind, setFormKind] = useState<"SINGLE" | "DEAL">("SINGLE");
  const [formDesc, setFormDesc] = useState("");
  const [formImageUrl, setFormImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [formVariants, setFormVariants] = useState<{ name: string; price: number }[]>([
    { name: "Small", price: 550 },
    { name: "Medium", price: 1050 },
    { name: "Large", price: 1550 },
  ]);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formModifiers, setFormModifiers] = useState<string[]>(["Crust Type", "Extra Toppings"]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/menu");
      const data = await res.json();
      const list = data.data?.items || data.items || [];
      if (list.length > 0) {
        setItems(list);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setFormName("");
    setFormCat("pizzas");
    setFormKind("SINGLE");
    setFormDesc("");
    setFormImageUrl(IMAGE_PRESETS[0].url);
    setFormVariants([
      { name: "Small", price: 550 },
      { name: "Medium", price: 1050 },
      { name: "Large", price: 1550 },
    ]);
    setFormTags([]);
    setFormModifiers(["Crust Type", "Extra Toppings"]);
    setEditingItem(null);
    setModalMode("add");
  };

  const openEditModal = (item: MenuItemSeed) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCat(item.categorySlug);
    setFormKind(item.kind);
    setFormDesc(item.description || "");
    setFormImageUrl(item.imageUrl);
    setFormVariants(item.variants.map((v) => ({ name: v.name, price: v.price })));
    setFormTags(item.tags || []);
    setFormModifiers(item.modifierGroupNames || []);
    setModalMode("edit");
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formVariants.length === 0) {
      alert("Please enter a name and at least one size variant with a price.");
      return;
    }

    setFormSubmitting(true);
    try {
      if (modalMode === "add") {
        const res = await fetch("/api/menu/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            categorySlug: formCat,
            kind: formKind,
            description: formDesc,
            imageUrl: formImageUrl,
            variants: formVariants,
            tags: formTags,
            modifierGroupNames: formModifiers,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setItems((prev) => [data.item, ...prev]);
          setFeedback(`"${data.item.name}" added to menu successfully!`);
          setModalMode(null);
        } else {
          alert(data.message || "Failed to add item");
        }
      } else if (modalMode === "edit" && editingItem) {
        const res = await fetch(`/api/menu/items/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            categorySlug: formCat,
            kind: formKind,
            description: formDesc,
            imageUrl: formImageUrl,
            variants: formVariants,
            tags: formTags,
            modifierGroupNames: formModifiers,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setItems((prev) => prev.map((i) => (i.id === editingItem.id ? data.item : i)));
          setFeedback(`"${data.item.name}" updated successfully!`);
          setModalMode(null);
        } else {
          alert(data.message || "Failed to update item");
        }
      }
    } catch {
      alert("Error saving item. Please try again.");
    } finally {
      setFormSubmitting(false);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleDeleteItem = async (item: MenuItemSeed) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.name}" from the menu?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/menu/items/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setFeedback(`"${item.name}" removed from menu.`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      alert("Failed to delete item.");
    }
  };

  const toggleAvailability = async (item: MenuItemSeed) => {
    const nextAvailable = !(item.isAvailable !== false);
    setUpdatingId(item.id);

    try {
      const res = await fetch("/api/menu/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, isAvailable: nextAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: nextAvailable } : i))
        );
        setFeedback(
          `"${item.name}" marked as ${nextAvailable ? "In Stock" : "Sold Out"}`
        );
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback("Failed to update item availability. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const addVariantRow = () => {
    setFormVariants((prev) => [...prev, { name: "Regular", price: 500 }]);
  };

  const removeVariantRow = (index: number) => {
    if (formVariants.length <= 1) return;
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setFormTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = items.filter((item) => {
    if (selectedCat !== "all" && item.categorySlug !== selectedCat) return false;
    if (search.trim() && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-charcoal p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber/10 border border-amber/30 text-amber text-xs font-semibold mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu Catalog & Inventory</span>
          </div>
          <h1 className="font-heading text-3xl uppercase tracking-wider text-white leading-tight">
            Menu Items Management
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            Add new recipes, update size prices, attach modifier options, and toggle instant sold-out switches for both website & POS register.
          </p>
        </div>

        {/* Add Item Action Button */}
        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber to-amber-dark text-charcoal font-heading uppercase text-sm font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Menu Item</span>
        </button>
      </div>

      {/* Success / Feedback Toast */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search & Category Filter Pills */}
      <div className="space-y-3">
        {/* Search row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by pizza or food name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-charcoal border border-stone-800 text-white rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-hidden focus:border-amber transition-colors"
            />
          </div>

          <div className="text-xs text-stone-400 font-medium">
            Showing <span className="text-white font-bold">{filtered.length}</span> of{" "}
            <span className="text-white font-bold">{items.length}</span> total items
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3.5 py-1.5 rounded-xl font-heading uppercase text-xs tracking-wider font-semibold transition-all whitespace-nowrap ${
              selectedCat === "all"
                ? "bg-amber text-charcoal shadow-sm"
                : "bg-charcoal text-stone-400 hover:text-white border border-stone-800"
            }`}
          >
            All Categories ({items.length})
          </button>
          {CATEGORIES_DATA.map((c) => {
            const count = items.filter((i) => i.categorySlug === c.slug).length;
            const isSelected = selectedCat === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.slug)}
                className={`px-3.5 py-1.5 rounded-xl font-heading uppercase text-xs tracking-wider font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-amber text-charcoal shadow-sm"
                    : "bg-charcoal text-stone-400 hover:text-white border border-stone-800"
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-charcoal rounded-3xl border border-stone-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 font-heading uppercase text-stone-400 text-[11px] tracking-wider">
              <tr>
                <th className="p-4">Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Sizes & Prices</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber" />
                    <span>Loading menu catalog...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    No menu items found. Click "+ Add New Menu Item" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isSoldOut = item.isAvailable === false;
                  const isBusy = updatingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-stone-900/60 transition-colors">
                      {/* Name & Photo */}
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-stone-700/50">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm leading-tight">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">
                            {item.description || "No description provided."}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 font-heading uppercase tracking-wider text-stone-400 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 font-semibold">
                          {item.categorySlug}
                        </span>
                      </td>

                      {/* Variants & Prices */}
                      <td className="p-4 font-mono font-medium text-stone-200">
                        <div className="flex flex-wrap gap-1.5">
                          {item.variants.map((v) => (
                            <span
                              key={v.name}
                              className="px-2 py-0.5 rounded bg-stone-900 text-amber border border-stone-800 text-[11px]"
                            >
                              {v.name}: {formatRupees(v.price)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Badges / Tags */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {item.tags?.includes("bestseller") && (
                            <span className="px-2 py-0.5 rounded-full bg-amber/20 text-amber border border-amber/30 text-[10px] font-bold uppercase">
                              Bestseller
                            </span>
                          )}
                          {item.tags?.includes("spicy") && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase">
                              Spicy
                            </span>
                          )}
                          {item.isDealOfDay && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold uppercase">
                              Deal of Day
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sold Out Switch */}
                      <td className="p-4">
                        <button
                          disabled={isBusy}
                          onClick={() => toggleAvailability(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                            isSoldOut
                              ? "bg-red-950/80 text-red-400 border-red-700/60 hover:bg-red-900"
                              : "bg-emerald-950/80 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900"
                          } disabled:opacity-50`}
                          title="Click to toggle availability"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSoldOut ? "bg-red-400" : "bg-emerald-400 animate-pulse"
                            }`}
                          />
                          <span>{isSoldOut ? "Sold Out" : "In Stock"}</span>
                        </button>
                      </td>

                      {/* Action buttons (Edit & Delete) */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="p-2 rounded-xl bg-stone-900 hover:bg-red-950/50 text-stone-400 hover:text-red-400 border border-stone-800 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-charcoal border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h3 className="font-heading text-2xl uppercase tracking-wider text-white">
                  {modalMode === "add" ? "Add New Menu Item" : "Edit Menu Item"}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Configure item pricing, size variants, and category assignment.
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-2 rounded-full bg-stone-900 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="space-y-5 text-xs">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-300 block mb-1">
                    Item Name <span className="text-rimjhimRed">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Malai Boti Supreme Pizza"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-white text-sm focus:border-amber focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-300 block mb-1">Category</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-white text-sm focus:border-amber focus:outline-hidden"
                  >
                    {CATEGORIES_DATA.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-stone-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, secret sauce, cheese blend..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-white text-xs focus:border-amber focus:outline-hidden"
                />
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="font-semibold text-stone-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono text-xs focus:border-amber focus:outline-hidden mb-2"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-stone-500 text-[11px] font-semibold">Presets:</span>
                  {IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormImageUrl(p.url)}
                      className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-300 hover:text-white hover:border-amber transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Variants Table */}
              <div className="border border-stone-800 rounded-2xl p-4 bg-stone-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-heading uppercase tracking-wider text-stone-300 text-xs font-bold">
                    Sizes & Prices (PKR) <span className="text-rimjhimRed">*</span>
                  </span>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber font-semibold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formVariants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Size name (e.g. Small / Regular)"
                        value={v.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormVariants((prev) =>
                            prev.map((item, idx) => (idx === i ? { ...item, name: val } : item))
                          );
                        }}
                        className="flex-1 bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white text-xs"
                      />
                      <div className="relative w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                          Rs
                        </span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={v.price}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setFormVariants((prev) =>
                              prev.map((item, idx) => (idx === i ? { ...item, price: val } : item))
                            );
                          }}
                          className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariantRow(i)}
                        disabled={formVariants.length <= 1}
                        className="p-2 text-stone-500 hover:text-red-400 disabled:opacity-30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Selector */}
              <div>
                <label className="font-semibold text-stone-300 block mb-1.5">Promotional Badges</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={formTags.includes("bestseller")}
                      onChange={() => toggleTag("bestseller")}
                      className="rounded accent-amber"
                    />
                    <span>⭐ Bestseller</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={formTags.includes("spicy")}
                      onChange={() => toggleTag("spicy")}
                      className="rounded accent-rimjhimRed"
                    />
                    <span>🔥 Spicy</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={formTags.includes("deal")}
                      onChange={() => toggleTag("deal")}
                      className="rounded accent-amber"
                    />
                    <span>🎉 Deal Bundle</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="border-t border-stone-800 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rimjhimRed hover:bg-rimjhimRed-dark text-white font-heading uppercase text-sm font-bold tracking-wider flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modalMode === "add" ? "Create Item" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
