"use client";

import { useState, useEffect } from "react";
import { DeliveryZoneSeed, DELIVERY_ZONES_DATA } from "@/lib/initial-data";
import { formatRupees } from "@/lib/format";
import {
  MapPin,
  Plus,
  Check,
  Loader2,
  Trash2,
  Search,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  Compass,
} from "lucide-react";

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZoneSeed[]>(DELIVERY_ZONES_DATA);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Add Zone Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState<number>(100);
  const [newZoneMinOrder, setNewZoneMinOrder] = useState<number>(500);
  const [newZoneEta, setNewZoneEta] = useState<number>(35);

  useEffect(() => {
    async function loadZones() {
      try {
        const res = await fetch("/api/store");
        const data = await res.json();
        if (data.success && data.data?.zones) {
          setZones(data.data.zones);
        }
      } catch {
        // fallback to default
      }
    }
    loadZones();
  }, []);

  const updateZone = (index: number, field: keyof DeliveryZoneSeed, val: number | string) => {
    setZones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleDeleteZone = (index: number) => {
    const zoneName = zones[index]?.name;
    if (confirm(`Are you sure you want to delete delivery coverage for "${zoneName}"?`)) {
      setZones((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    const newZone: DeliveryZoneSeed = {
      name: newZoneName.trim(),
      fee: Number(newZoneFee) || 0,
      minOrder: Number(newZoneMinOrder) || 0,
      etaMinutes: Number(newZoneEta) || 35,
    };

    setZones((prev) => [...prev, newZone]);
    setShowAddModal(false);
    setNewZoneName("");
    setNewZoneFee(100);
    setNewZoneMinOrder(500);
    setNewZoneEta(35);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/store/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        alert(data.message || "Failed to save delivery zones.");
      }
    } catch {
      alert("Failed to save delivery zones.");
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = zones.filter((z) =>
    z.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
              Delivery Areas & Tariffs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber/20 text-amber border border-amber/30">
              {zones.length} Zones
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Configure delivery coverage areas across Bahawalpur city, delivery tariffs, minimum order thresholds, and rider ETA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber" />
            <span>+ Add New Area</span>
          </button>

          <button
            disabled={loading}
            onClick={handleSave}
            className="bg-rimjhimRed hover:bg-rimjhimRed-dark text-white font-heading uppercase text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-transform active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Delivery zones and tariffs successfully updated! Customers will now see these rates at checkout.</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-charcoal p-4 rounded-2xl border border-stone-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search delivery zone name..."
            className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber"
          />
        </div>

        <div className="text-xs text-stone-400">
          Showing <span className="font-bold text-white">{filteredZones.length}</span> of{" "}
          <span className="font-bold text-white">{zones.length}</span> sectors
        </div>
      </div>

      {/* Zones Table */}
      <div className="bg-charcoal rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 font-heading uppercase text-stone-400 text-[11px] tracking-wider">
              <tr>
                <th className="p-4">Delivery Zone / Sector</th>
                <th className="p-4">Delivery Fee (PKR)</th>
                <th className="p-4">Min. Order (PKR)</th>
                <th className="p-4">Rider ETA (Mins)</th>
                <th className="p-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filteredZones.map((zone, idx) => {
                const realIndex = zones.indexOf(zone);
                return (
                  <tr key={idx} className="hover:bg-stone-800/30 transition-colors">
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber shrink-0" />
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => updateZone(realIndex, "name", e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-stone-700 focus:border-amber focus:bg-stone-900 px-1.5 py-0.5 rounded text-white font-bold text-xs"
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500 font-mono">Rs</span>
                        <input
                          type="number"
                          value={zone.fee}
                          onChange={(e) => updateZone(realIndex, "fee", Number(e.target.value) || 0)}
                          className="w-24 bg-stone-900 border border-stone-700 rounded-lg p-1.5 font-mono text-white text-xs text-center focus:outline-hidden focus:border-amber"
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500 font-mono">Rs</span>
                        <input
                          type="number"
                          value={zone.minOrder}
                          onChange={(e) =>
                            updateZone(realIndex, "minOrder", Number(e.target.value) || 0)
                          }
                          className="w-24 bg-stone-900 border border-stone-700 rounded-lg p-1.5 font-mono text-white text-xs text-center focus:outline-hidden focus:border-amber"
                        />
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <input
                          type="number"
                          value={zone.etaMinutes}
                          onChange={(e) =>
                            updateZone(realIndex, "etaMinutes", Number(e.target.value) || 0)
                          }
                          className="w-20 bg-stone-900 border border-stone-700 rounded-lg p-1.5 font-mono text-white text-xs text-center focus:outline-hidden focus:border-amber"
                        />
                        <span className="text-stone-500 text-[10px]">mins</span>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteZone(realIndex)}
                        title="Remove Zone"
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-rimjhimRed text-stone-400 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber" />
                <h3 className="font-heading text-lg text-white uppercase">Add New Delivery Sector</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddZone} className="space-y-4 text-xs">
              <div>
                <label className="text-stone-300 font-semibold block mb-1">
                  Sector / Area Name:
                </label>
                <input
                  type="text"
                  required
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. IUB Baghdad Campus, Model Town C"
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">
                    Delivery Fee (Rs):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newZoneFee}
                    onChange={(e) => setNewZoneFee(Number(e.target.value) || 0)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-semibold block mb-1">
                    Min. Order Value (Rs):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newZoneMinOrder}
                    onChange={(e) => setNewZoneMinOrder(Number(e.target.value) || 0)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 font-semibold block mb-1">
                  Estimated Rider Delivery Time (Minutes):
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={newZoneEta}
                  onChange={(e) => setNewZoneEta(Number(e.target.value) || 30)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newZoneName.trim()}
                  className="px-4 py-2 rounded-xl bg-amber hover:bg-amber/90 text-charcoal font-heading uppercase text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Sector</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
