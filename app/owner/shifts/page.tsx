"use client";

import { useState, useEffect } from "react";
import { ShiftRecord } from "@/lib/mock-db";
import { formatRupees } from "@/lib/format";
import { Wallet, Lock, CheckCircle, AlertCircle, ArrowRight, Play, Loader2 } from "lucide-react";

export default function ShiftsPage() {
  const [shiftData, setShiftData] = useState<{
    shift: ShiftRecord & { currentCashSales: number; expectedInDrawer: number };
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [countedCashInput, setCountedCashInput] = useState("");
  const [openingCashInput, setOpeningCashInput] = useState("5000");
  const [cashierNameInput, setCashierNameInput] = useState("Counter Cashier");
  const [statusMessage, setStatusMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchShift = async () => {
    try {
      const res = await fetch("/api/shifts/current");
      const data = await res.json();
      if (data.success) {
        setShiftData({ shift: data.shift });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/shifts/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierName: shiftData?.shift?.openedBy || "Counter Cashier",
          countedCash: Number(countedCashInput) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Shift closed successfully! Totals archived for the day.");
        setCountedCashInput("");
        fetchShift();
      }
    } catch {
      setStatusMessage("Failed to close shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/shifts/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierName: cashierNameInput.trim() || "Counter Staff",
          openingCash: Number(openingCashInput) || 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("New shift opened successfully! Ready for counter sales.");
        fetchShift();
      }
    } catch {
      setStatusMessage("Failed to open shift");
    } finally {
      setActionLoading(false);
    }
  };

  const shift = shiftData?.shift;
  const isShiftOpen = shift?.status === "OPEN";
  const counted = Number(countedCashInput) || 0;
  const expected = shift?.expectedInDrawer || 0;
  const variance = counted - expected;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-charcoal p-6 rounded-2xl border border-stone-800 space-y-2">
        <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
          Cash Shift & Drawer Close
        </h1>
        <p className="text-xs text-stone-400">
          Reconcile physical register cash at the counter against all cash orders processed today.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Current Shift Summary */}
      <div className="bg-charcoal p-6 rounded-2xl border border-stone-800 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <div className="font-heading text-xl uppercase tracking-wider text-white">
              {shift?.id ? `Shift #${shift.id}` : "Shift Management"}
            </div>
            <div className="text-xs text-stone-400 mt-0.5">
              Cashier: <span className="text-white font-semibold">{shift?.openedBy || "Counter Cashier"}</span> • Opened at{" "}
              {shift?.openedAt ? new Date(shift.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-heading uppercase font-bold tracking-wider ${
              isShiftOpen
                ? "bg-emerald-950 border border-emerald-800 text-emerald-300"
                : "bg-stone-800 border border-stone-700 text-stone-400"
            }`}
          >
            {isShiftOpen ? "● Open Shift" : "Closed Shift"}
          </span>
        </div>

        {isShiftOpen ? (
          <>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-stone-300">
                <span>Opening Cash Float:</span>
                <span className="font-mono text-white font-semibold">
                  {formatRupees(shift?.openingCash || 0)}
                </span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span>Today&apos;s Completed Cash Sales:</span>
                <span className="font-mono text-freshLime font-bold">
                  +{formatRupees(shift?.currentCashSales || 0)}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm border-t border-stone-800 pt-2">
                <span>Expected Cash in Register:</span>
                <span className="font-heading text-xl text-amber">
                  {formatRupees(expected)}
                </span>
              </div>
            </div>

            {/* Closing form */}
            <form onSubmit={handleCloseShift} className="border-t border-stone-800 pt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                  Counted Physical Cash in Drawer (Rs):
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Count physical notes and coins..."
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-sm font-mono text-white focus:outline-hidden focus:border-amber"
                />
              </div>

              {countedCashInput && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between font-bold ${
                    variance === 0
                      ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                      : variance > 0
                      ? "bg-blue-950/60 border-blue-800 text-blue-300"
                      : "bg-red-950/60 border-red-800 text-red-300"
                  }`}
                >
                  <span>
                    {variance === 0
                      ? "Perfect Match! Zero discrepancy."
                      : variance > 0
                      ? "Cash Over:"
                      : "Cash Short (Shortage):"}
                  </span>
                  <span className="font-heading text-base font-bold">
                    {formatRupees(Math.abs(variance))}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 bg-rimjhimRed hover:bg-rimjhimRed-dark text-white rounded-xl font-heading text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-md font-bold transition-all disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Close Shift & Reconcile Day</span>
              </button>
            </form>
          </>
        ) : (
          /* Open Shift Form */
          <form onSubmit={handleOpenShift} className="border-t border-stone-800 pt-4 space-y-4">
            <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-300">
              The register is currently closed. Enter starting float cash to open a new sales shift.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-stone-300 block mb-1">Cashier Name:</label>
                <input
                  type="text"
                  required
                  value={cashierNameInput}
                  onChange={(e) => setCashierNameInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">Opening Cash Float (Rs):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={openingCashInput}
                  onChange={(e) => setOpeningCashInput(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-heading text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-md font-bold transition-all disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Open New Cash Register Shift</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
