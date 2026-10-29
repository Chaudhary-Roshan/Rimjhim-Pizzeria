"use client";

import { useState, useEffect } from "react";
import { STORE_SETTINGS } from "@/lib/initial-data";
import {
  Settings,
  Save,
  Check,
  Loader2,
  Store,
  Phone,
  Clock,
  Share2,
  ExternalLink,
  Power,
  Percent,
} from "lucide-react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(STORE_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/store");
        const data = await res.json();
        if (data.success && data.data) {
          const { zones: _, ...rest } = data.data;
          setSettings({
            ...STORE_SETTINGS,
            ...rest,
            socials: {
              ...STORE_SETTINGS.socials,
              ...(rest.socials || {}),
            },
          });
        }
      } catch {
        // use default
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/store/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        alert(data.message || "Failed to save settings");
      }
    } catch {
      alert("Failed to save store settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
            Store & Branch Settings
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Control branch information, operational hours, business day cut-off time, and online order acceptance.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Store settings saved successfully! All storefront pages and POS registers have been updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Master Ordering Switch */}
        <div className="bg-charcoal p-6 rounded-2xl border border-stone-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                settings.acceptingOrders
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                <span>Accepting Online Orders</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    settings.acceptingOrders
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-red-950 text-red-400 border border-red-800"
                  }`}
                >
                  {settings.acceptingOrders ? "Online Now" : "Orders Paused"}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1 max-w-lg">
                When paused (e.g. during heavy kitchen rushes or after closing), customers can still browse the menu, but checkout displays a friendly pause notice.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSettings((prev) => ({ ...prev, acceptingOrders: !prev.acceptingOrders }))
            }
            className={`px-5 py-2.5 rounded-xl font-heading uppercase text-xs font-bold transition-all shadow-md active:scale-95 ${
              settings.acceptingOrders
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
            }`}
          >
            {settings.acceptingOrders ? "Turn Off Ordering" : "Resume Ordering"}
          </button>
        </div>

        {/* Basic Store & Contact Info */}
        <div className="bg-charcoal p-6 rounded-2xl border border-stone-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
            <Store className="w-4 h-4 text-amber" />
            <h2 className="font-heading text-base text-white uppercase tracking-wider">
              Store & Contact Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-stone-300 font-semibold block mb-1">Store Name:</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
              />
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Branch Address:</label>
              <input
                type="text"
                value={settings.branch}
                onChange={(e) => setSettings({ ...settings, branch: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
              />
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Primary Phone:</label>
              <input
                type="text"
                value={settings.phonePrimary}
                onChange={(e) => setSettings({ ...settings, phonePrimary: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-amber"
              />
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Secondary Phone:</label>
              <input
                type="text"
                value={settings.phoneSecondary}
                onChange={(e) => setSettings({ ...settings, phoneSecondary: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-amber"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-stone-300 font-semibold block mb-1">
                WhatsApp Business Number (with country code):
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="e.g. 923086547672"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-amber"
              />
              <span className="text-[10px] text-stone-500 mt-1 block">
                Order confirmation receipts and customer chats will open this WhatsApp number.
              </span>
            </div>
          </div>
        </div>

        {/* Operating Hours & Accounting Cut-off */}
        <div className="bg-charcoal p-6 rounded-2xl border border-stone-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
            <Clock className="w-4 h-4 text-amber" />
            <h2 className="font-heading text-base text-white uppercase tracking-wider">
              Operating Hours & Fiscal Cut-off
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-stone-300 font-semibold block mb-1">Opening Time:</label>
              <input
                type="text"
                value={settings.openingHour}
                onChange={(e) => setSettings({ ...settings, openingHour: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
              />
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Closing Time:</label>
              <input
                type="text"
                value={settings.closingHour}
                onChange={(e) => setSettings({ ...settings, closingHour: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
              />
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">
                Business Day Cut-off (Hour 0-23):
              </label>
              <input
                type="number"
                min="0"
                max="23"
                value={settings.businessDayCutoffHour}
                onChange={(e) =>
                  setSettings({ ...settings, businessDayCutoffHour: Number(e.target.value) || 4 })
                }
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono focus:outline-hidden focus:border-amber"
              />
            </div>
          </div>
          <span className="text-[10px] text-stone-500 block">
            Orders placed past midnight until 4 AM count toward the previous night&apos;s shift & daily sales reports.
          </span>
        </div>

        {/* Social Media Links */}
        <div className="bg-charcoal p-6 rounded-2xl border border-stone-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
            <Share2 className="w-4 h-4 text-amber" />
            <h2 className="font-heading text-base text-white uppercase tracking-wider">
              Social Media Handles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-stone-300 font-semibold block mb-1">Instagram:</label>
              <input
                type="text"
                value={settings.socials?.instagram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socials: { ...settings.socials, instagram: e.target.value },
                  })
                }
                placeholder="@rimjhimpizzeria"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
              />
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Facebook:</label>
              <input
                type="text"
                value={settings.socials?.facebook || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socials: { ...settings.socials, facebook: e.target.value },
                  })
                }
                placeholder="@rimjhimpizzeria"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
              />
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Snapchat:</label>
              <input
                type="text"
                value={settings.socials?.snapchat || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socials: { ...settings.socials, snapchat: e.target.value },
                  })
                }
                placeholder="@rimjhimpizzeria"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-amber"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rimjhimRed hover:bg-rimjhimRed-dark text-white font-heading uppercase text-sm py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Store Settings</span>
        </button>
      </form>
    </div>
  );
}
