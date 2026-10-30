"use client";

import { useState, useEffect, useMemo } from "react";
import { ShiftRecord, ShiftTransaction } from "@/lib/mock-db";
import { formatRupees } from "@/lib/format";
import {
  Wallet,
  Lock,
  CheckCircle,
  AlertCircle,
  Play,
  Loader2,
  Printer,
  History,
  TrendingUp,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Calendar,
  Clock,
  User,
  X,
  FileText,
  Calculator,
  ArrowDownCircle,
  ArrowUpCircle,
  ShoppingBag,
  Bike,
  Store,
  Search,
  Filter,
  DollarSign,
  Plus,
} from "lucide-react";

interface LiveShiftData extends ShiftRecord {
  currentCashSales: number;
  expectedInDrawer: number;
  cardSales?: number;
  jazzCashSales?: number;
  easyPaisaSales?: number;
  totalSales?: number;
  ordersCount?: number;
  dineInOrdersCount?: number;
  takeawayOrdersCount?: number;
  deliveryOrdersCount?: number;
  dineInSales?: number;
  takeawaySales?: number;
  deliverySales?: number;
  discountsTotal?: number;
  deliveryFeesTotal?: number;
  cashInTotal?: number;
  safeDropTotal?: number;
  expensesTotal?: number;
  transactions?: ShiftTransaction[];
}

export default function ShiftsPage() {
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");
  const [shift, setShift] = useState<LiveShiftData | null>(null);
  const [history, setHistory] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [countedCashInput, setCountedCashInput] = useState("");
  const [closingNotesInput, setClosingNotesInput] = useState("");
  const [openingCashInput, setOpeningCashInput] = useState("5000");
  const [cashierNameInput, setCashierNameInput] = useState("Counter Staff");
  const [statusMessage, setStatusMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Cash Movement Modal (Safe Drop, Expense, Cash In)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"SAFE_DROP" | "EXPENSE" | "CASH_IN">("SAFE_DROP");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementReason, setMovementReason] = useState("");

  // Denomination Counter Modal
  const [isDenomOpen, setIsDenomOpen] = useState(false);
  const [denoms, setDenoms] = useState<{ [key: number]: number }>({
    5000: 0,
    1000: 0,
    500: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0, // coins
  });

  // History Filter & Search
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "MATCH" | "OVER" | "SHORT">("ALL");

  // Z-Report Modal
  const [zReportShift, setZReportShift] = useState<ShiftRecord | LiveShiftData | null>(null);

  const fetchShiftData = async () => {
    try {
      const res = await fetch("/api/shifts/current");
      const data = await res.json();
      if (data.success) {
        setShift(data.shift);
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error("Failed to load shift data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShiftData();
  }, []);

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
        fetchShiftData();
      }
    } catch {
      setStatusMessage("Failed to open shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/shifts/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashierName: shift?.openedBy || "Counter Staff",
          countedCash: Number(countedCashInput) || 0,
          notes: closingNotesInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Shift closed successfully! Daily Z-Report archived.");
        setCountedCashInput("");
        setClosingNotesInput("");
        // Show Z-report immediately for print
        if (data.shift) {
          setZReportShift(data.shift);
        }
        fetchShiftData();
      }
    } catch {
      setStatusMessage("Failed to close shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementAmount || Number(movementAmount) <= 0 || !movementReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/shifts/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: movementType,
          amount: Number(movementAmount),
          reason: movementReason.trim(),
          staffName: shift?.openedBy || "Counter Staff",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsMovementModalOpen(false);
        setMovementAmount("");
        setMovementReason("");
        setStatusMessage(
          movementType === "SAFE_DROP"
            ? `Safe drop of ${formatRupees(Number(movementAmount))} recorded.`
            : movementType === "EXPENSE"
            ? `Petty expense of ${formatRupees(Number(movementAmount))} deducted.`
            : `Cash float addition of ${formatRupees(Number(movementAmount))} registered.`
        );
        fetchShiftData();
      }
    } catch {
      setStatusMessage("Failed to record cash transaction");
    } finally {
      setActionLoading(false);
    }
  };

  // Denomination sum
  const denomTotal = useMemo(() => {
    return Object.entries(denoms).reduce((sum, [denom, count]) => {
      return sum + Number(denom) * (count || 0);
    }, 0);
  }, [denoms]);

  const applyDenomsToCount = () => {
    setCountedCashInput(String(denomTotal));
    setIsDenomOpen(false);
  };

  const isShiftOpen = shift?.status === "OPEN";
  const counted = Number(countedCashInput) || 0;
  const expected = shift?.expectedInDrawer ?? (shift?.expectedCash || 0);
  const variance = counted - expected;

  // Filtered shift history
  const filteredHistory = useMemo(() => {
    return history.filter((s) => {
      // Search by shiftNo or cashier
      if (historySearch) {
        const query = historySearch.toLowerCase();
        const matchesNo = (s.shiftNo || s.id).toLowerCase().includes(query);
        const matchesStaff = (s.openedBy || "").toLowerCase().includes(query) || (s.closedBy || "").toLowerCase().includes(query);
        if (!matchesNo && !matchesStaff) return false;
      }

      // Filter by variance
      if (historyFilter !== "ALL") {
        const c = s.countedCash ?? 0;
        const e = s.expectedCash ?? 0;
        const diff = c - e;
        if (historyFilter === "MATCH" && diff !== 0) return false;
        if (historyFilter === "OVER" && diff <= 0) return false;
        if (historyFilter === "SHORT" && diff >= 0) return false;
      }

      return true;
    });
  }, [history, historySearch, historyFilter]);

  // History statistics summary
  const historyStats = useMemo(() => {
    const totalVolume = history.reduce((sum, s) => sum + (s.totalSales ?? s.cashSales ?? 0), 0);
    const totalVariance = history.reduce((sum, s) => {
      const c = s.countedCash ?? 0;
      const e = s.expectedCash ?? 0;
      return sum + (c - e);
    }, 0);
    return { totalVolume, totalVariance, count: history.length };
  }, [history]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-charcoal p-5 sm:p-6 rounded-3xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber/20 border border-amber/30 text-amber flex items-center justify-center font-bold text-lg">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
                Cash Shifts & Drawer
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Physical register cash floats, petty cash drops/expenses, sales reconciliation, and daily Z-reports
              </p>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-stone-900 border border-stone-800 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-xl text-xs font-heading uppercase font-bold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "live"
                ? "bg-amber text-charcoal shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Active Shift</span>
            {isShiftOpen && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-heading uppercase font-bold tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-amber text-charcoal shadow-sm"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Shift History ({history.length})</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage("")}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: LIVE SHIFT */}
      {activeTab === "live" && (
        <div className="space-y-6">
          {/* Active Shift Card */}
          <div className="bg-charcoal p-5 sm:p-6 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
            {/* Header info & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-heading text-xl sm:text-2xl uppercase tracking-wider text-white">
                    {shift?.shiftNo || (shift?.id ? `Shift #${shift.id}` : "Register Status")}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-heading uppercase font-bold tracking-wider ${
                      isShiftOpen
                        ? "bg-emerald-950 border border-emerald-800 text-emerald-300 animate-pulse"
                        : "bg-stone-800 border border-stone-700 text-stone-400"
                    }`}
                  >
                    {isShiftOpen ? "● Shift Live" : "Register Closed"}
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-1 flex flex-wrap items-center gap-3">
                  <span>
                    Cashier: <strong className="text-white">{shift?.openedBy || "None"}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Opened:{" "}
                    <strong className="text-white">
                      {shift?.openedAt
                        ? new Date(shift.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
                          ", " +
                          new Date(shift.openedAt).toLocaleDateString([], { month: "short", day: "numeric" })
                        : "—"}
                    </strong>
                  </span>
                </div>
              </div>

              {isShiftOpen && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMovementModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber border border-amber/30 text-xs font-heading uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Drop / Expense</span>
                  </button>
                  <button
                    onClick={() => setZReportShift(shift)}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 text-xs font-heading uppercase tracking-wider font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber" />
                    <span>Mid-Shift Z-Report</span>
                  </button>
                </div>
              )}
            </div>

            {isShiftOpen ? (
              <>
                {/* Real-time Sales Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                      Opening Float
                    </span>
                    <span className="font-heading text-xl text-white font-mono">
                      {formatRupees(shift?.openingCash || 0)}
                    </span>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                      Cash Sales
                    </span>
                    <span className="font-heading text-xl text-freshLime font-mono">
                      +{formatRupees(shift?.currentCashSales || 0)}
                    </span>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                      Digital Sales
                    </span>
                    <span className="font-heading text-xl text-sky-400 font-mono">
                      {formatRupees(
                        (shift?.cardSales || 0) +
                          (shift?.jazzCashSales || 0) +
                          (shift?.easyPaisaSales || 0)
                      )}
                    </span>
                  </div>

                  <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                      Total Orders
                    </span>
                    <span className="font-heading text-xl text-amber font-mono">
                      {shift?.ordersCount || 0} orders
                    </span>
                  </div>
                </div>

                {/* Secondary breakdown: Order Channels & Tender Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* By Order Channel */}
                  <div className="bg-stone-900/80 border border-stone-800/80 p-3.5 rounded-2xl space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                      Channel Breakdown
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-300">
                          <Store className="w-3.5 h-3.5 text-amber" /> Dine-In:
                        </span>
                        <span className="font-mono text-white font-medium">
                          {shift?.dineInOrdersCount || 0} orders ({formatRupees(shift?.dineInSales || 0)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-300">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Takeaway:
                        </span>
                        <span className="font-mono text-white font-medium">
                          {shift?.takeawayOrdersCount || 0} orders ({formatRupees(shift?.takeawaySales || 0)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-300">
                          <Bike className="w-3.5 h-3.5 text-rimjhimRed" /> Delivery:
                        </span>
                        <span className="font-mono text-white font-medium">
                          {shift?.deliveryOrdersCount || 0} orders ({formatRupees(shift?.deliverySales || 0)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* By Payment Method */}
                  <div className="bg-stone-900/80 border border-stone-800/80 p-3.5 rounded-2xl space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                      Payment Methods
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-300">
                          <Banknote className="w-3.5 h-3.5 text-freshLime" /> Cash:
                        </span>
                        <span className="font-mono text-white font-medium">
                          {formatRupees(shift?.currentCashSales || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-300">
                          <CreditCard className="w-3.5 h-3.5 text-sky-400" /> Card / POS:
                        </span>
                        <span className="font-mono text-white font-medium">
                          {formatRupees(shift?.cardSales || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-stone-300">
                          <Smartphone className="w-3.5 h-3.5 text-red-400" /> JazzCash / EasyPaisa:
                        </span>
                        <span className="font-mono text-white font-medium">
                          {formatRupees((shift?.jazzCashSales || 0) + (shift?.easyPaisaSales || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cash Movements Ledger (Safe drops, expenses, cash float in) */}
                <div className="bg-stone-900/80 border border-stone-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-stone-300 block">
                        Drawer Cash Adjustments & Petty Cash:
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Cash Drops (-{formatRupees(shift?.safeDropTotal || 0)}) • Expenses (-{formatRupees(shift?.expensesTotal || 0)}) • Additions (+{formatRupees(shift?.cashInTotal || 0)})
                      </span>
                    </div>
                    <button
                      onClick={() => setIsMovementModalOpen(true)}
                      className="px-2.5 py-1 bg-stone-800 hover:bg-stone-750 text-amber text-xs font-semibold rounded-lg flex items-center gap-1 border border-stone-700"
                    >
                      <Plus className="w-3 h-3" /> Record
                    </button>
                  </div>

                  {(!shift?.transactions || shift.transactions.length === 0) ? (
                    <div className="text-stone-500 text-xs text-center py-2 italic">
                      No safe drops or petty cash expenses recorded during this shift.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-800/80 text-xs">
                      {shift.transactions.map((tx) => (
                        <div key={tx.id} className="py-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                tx.type === "SAFE_DROP"
                                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                                  : tx.type === "EXPENSE"
                                  ? "bg-red-950 text-red-300 border border-red-800"
                                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              }`}
                            >
                              {tx.type === "SAFE_DROP"
                                ? "Safe Drop"
                                : tx.type === "EXPENSE"
                                ? "Expense"
                                : "Cash Float In"}
                            </span>
                            <span className="text-stone-200">{tx.reason}</span>
                            <span className="text-[10px] text-stone-500">
                              ({new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                            </span>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              tx.type === "CASH_IN" ? "text-freshLime" : "text-red-400"
                            }`}
                          >
                            {tx.type === "CASH_IN" ? "+" : "-"}
                            {formatRupees(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expected Cash Highlight Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-stone-300 block">
                      Expected Cash in Register:
                    </span>
                    <span className="text-[11px] text-stone-400 mt-0.5">
                      Opening float ({formatRupees(shift?.openingCash || 0)}) + Shift cash ({formatRupees(shift?.currentCashSales || 0)})
                      {(shift?.safeDropTotal || 0) > 0 && ` - Safe drops (${formatRupees(shift?.safeDropTotal || 0)})`}
                      {(shift?.expensesTotal || 0) > 0 && ` - Expenses (${formatRupees(shift?.expensesTotal || 0)})`}
                      {(shift?.cashInTotal || 0) > 0 && ` + Float in (${formatRupees(shift?.cashInTotal || 0)})`}
                    </span>
                  </div>
                  <span className="font-heading text-2xl sm:text-3xl text-amber font-mono font-bold">
                    {formatRupees(expected)}
                  </span>
                </div>

                {/* Reconciliation & Closing Form */}
                <form onSubmit={handleCloseShift} className="border-t border-stone-800 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading uppercase text-sm tracking-wider text-white font-bold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rimjhimRed" />
                      <span>Shift Close & Drawer Count:</span>
                    </h3>

                    {/* Denomination Counter Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsDenomOpen((prev) => !prev)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5 text-amber" />
                      <span>{isDenomOpen ? "Hide Calculator" : "Currency Note Counter"}</span>
                    </button>
                  </div>

                  {/* Interactive Currency Note Counter Widget */}
                  {isDenomOpen && (
                    <div className="bg-stone-900 border border-amber/30 rounded-2xl p-4 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                        <span className="text-xs font-heading uppercase text-amber tracking-wider font-bold flex items-center gap-1.5">
                          <Calculator className="w-4 h-4" /> Physical Note Counter
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Calculated: <span className="text-amber text-sm">{formatRupees(denomTotal)}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        {[5000, 1000, 500, 100, 50, 20, 10, 5].map((note) => (
                          <div key={note} className="bg-stone-800/80 p-2 rounded-xl border border-stone-700/60 flex items-center justify-between">
                            <span className="font-mono text-stone-300">
                              {note === 5 ? "Coins" : `Rs ${note}`}:
                            </span>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={denoms[note] || ""}
                              onChange={(e) =>
                                setDenoms((prev) => ({
                                  ...prev,
                                  [note]: Math.max(0, parseInt(e.target.value) || 0),
                                }))
                              }
                              className="w-16 bg-stone-900 border border-stone-600 rounded text-right px-1.5 py-0.5 text-white font-mono text-xs focus:outline-hidden focus:border-amber"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={applyDenomsToCount}
                          className="px-4 py-2 bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Insert Count ({formatRupees(denomTotal)})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                        Physical Cash Counted in Drawer (Rs):
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 18500"
                        value={countedCashInput}
                        onChange={(e) => setCountedCashInput(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-2xl p-3 text-base font-mono text-white focus:outline-hidden focus:border-amber"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                        Closing Remarks / Notes (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Evening counter handover verified"
                        value={closingNotesInput}
                        onChange={(e) => setClosingNotesInput(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-2xl p-3 text-sm text-white focus:outline-hidden focus:border-amber"
                      />
                    </div>
                  </div>

                  {countedCashInput && (
                    <div
                      className={`p-4 rounded-2xl border text-xs flex items-center justify-between font-bold transition-all ${
                        variance === 0
                          ? "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                          : variance > 0
                          ? "bg-blue-950/80 border-blue-800 text-blue-300"
                          : "bg-red-950/80 border-red-800 text-red-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {variance === 0 ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                        <span>
                          {variance === 0
                            ? "Perfect Match! Zero cash discrepancy."
                            : variance > 0
                            ? "Cash Over (Surplus in drawer):"
                            : "Cash Shortage (Short in drawer):"}
                        </span>
                      </div>
                      <span className="font-heading text-lg font-mono font-bold">
                        {variance > 0 ? "+" : ""}
                        {formatRupees(variance)}
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={actionLoading || !countedCashInput}
                    className="w-full py-4 bg-rimjhimRed hover:bg-rimjhimRed-dark text-white rounded-2xl font-heading text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl font-bold transition-all disabled:opacity-50 active:scale-98"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                    <span>Reconcile Drawer & Close Shift</span>
                  </button>
                </form>
              </>
            ) : (
              /* Open Shift Form */
              <form onSubmit={handleOpenShift} className="border-t border-stone-800 pt-5 space-y-4">
                <div className="p-4 bg-stone-900 rounded-2xl border border-stone-800 text-xs text-stone-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber/20 text-amber flex items-center justify-center font-bold shrink-0">
                    ℹ
                  </div>
                  <span>
                    The cash register is currently closed. Enter your starting cash float (coins and change) to open a fresh sales shift.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-stone-300 block mb-1.5">
                      Cashier / Opener Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={cashierNameInput}
                      onChange={(e) => setCashierNameInput(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-2xl p-3 text-sm text-white focus:outline-hidden focus:border-amber"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-300 block mb-1.5">
                      Starting Cash Float (Rs):
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={openingCashInput}
                      onChange={(e) => setOpeningCashInput(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-2xl p-3 text-base font-mono text-white focus:outline-hidden focus:border-amber"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-heading text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl font-bold transition-all disabled:opacity-50 active:scale-98"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  <span>Open New Cash Register Shift</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHIFT HISTORY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Top Analytics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-charcoal p-4 rounded-2xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Archived Shifts
              </span>
              <span className="font-heading text-2xl text-white">
                {historyStats.count} shifts
              </span>
            </div>
            <div className="bg-charcoal p-4 rounded-2xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Total Reconciled Sales
              </span>
              <span className="font-heading text-2xl text-freshLime font-mono">
                {formatRupees(historyStats.totalVolume)}
              </span>
            </div>
            <div className="bg-charcoal p-4 rounded-2xl border border-stone-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-1">
                Net Discrepancy Balance
              </span>
              <span
                className={`font-heading text-2xl font-mono ${
                  historyStats.totalVariance === 0
                    ? "text-emerald-400"
                    : historyStats.totalVariance > 0
                    ? "text-blue-400"
                    : "text-red-400"
                }`}
              >
                {historyStats.totalVariance > 0 ? "+" : ""}
                {formatRupees(historyStats.totalVariance)}
              </span>
            </div>
          </div>

          {/* History Controls: Search & Filter */}
          <div className="bg-charcoal p-4 sm:p-5 rounded-3xl border border-stone-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Shift # (e.g. SH-...) or Cashier name..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
                {(
                  [
                    { key: "ALL", label: "All" },
                    { key: "MATCH", label: "Balanced" },
                    { key: "OVER", label: "Cash Over" },
                    { key: "SHORT", label: "Cash Short" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setHistoryFilter(f.key)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      historyFilter === f.key
                        ? "bg-amber text-charcoal font-bold shadow-xs"
                        : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-xs">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <span>No matching shifts found in archive.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-[11px] font-heading uppercase text-stone-400 tracking-wider">
                      <th className="py-3 px-3">Shift</th>
                      <th className="py-3 px-3">Time Range</th>
                      <th className="py-3 px-3">Staff</th>
                      <th className="py-3 px-3 text-right">Opening Float</th>
                      <th className="py-3 px-3 text-right">Total Sales</th>
                      <th className="py-3 px-3 text-right">Expected Drawer</th>
                      <th className="py-3 px-3 text-right">Counted Cash</th>
                      <th className="py-3 px-3 text-center">Variance</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-mono">
                    {filteredHistory.map((s) => {
                      const countedVal = s.countedCash ?? 0;
                      const expectedVal = s.expectedCash ?? 0;
                      const diff = countedVal - expectedVal;

                      return (
                        <tr key={s.id} className="hover:bg-stone-900/50 transition-colors">
                          <td className="py-3 px-3 font-heading text-white font-bold whitespace-nowrap">
                            {s.shiftNo || s.id}
                          </td>
                          <td className="py-3 px-3 text-stone-300 whitespace-nowrap">
                            <div>
                              {new Date(s.openedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </div>
                            <div className="text-[10px] text-stone-500">
                              {new Date(s.openedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              {s.closedAt && ` - ${new Date(s.closedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-stone-200 whitespace-nowrap font-sans">
                            <div>{s.openedBy}</div>
                            {s.closedBy && s.closedBy !== s.openedBy && (
                              <div className="text-[10px] text-stone-500">Closed: {s.closedBy}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right text-stone-300">
                            {formatRupees(s.openingCash)}
                          </td>
                          <td className="py-3 px-3 text-right text-freshLime font-bold">
                            {formatRupees(s.totalSales ?? s.cashSales ?? 0)}
                          </td>
                          <td className="py-3 px-3 text-right text-amber font-bold">
                            {formatRupees(expectedVal)}
                          </td>
                          <td className="py-3 px-3 text-right text-white font-bold">
                            {formatRupees(countedVal)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                diff === 0
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : diff > 0
                                  ? "bg-blue-950 text-blue-300 border border-blue-800"
                                  : "bg-red-950 text-red-300 border border-red-800"
                              }`}
                            >
                              {diff === 0 ? "Match" : diff > 0 ? `+${diff}` : `${diff}`}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setZReportShift(s)}
                              className="px-2.5 py-1 bg-stone-800 hover:bg-amber hover:text-charcoal text-stone-300 rounded-lg text-xs font-sans font-semibold transition-colors flex items-center gap-1 ml-auto"
                              title="View / Print Z-Report"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Z-Report</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CASH MOVEMENT MODAL (Safe Drop, Expense, Cash In) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-charcoal border border-stone-700 rounded-3xl max-w-md w-full p-5 sm:p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber" />
                <h3 className="font-heading text-lg uppercase">Record Cash Adjustment</h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Adjustment Type:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "SAFE_DROP", label: "Safe Drop (Out)" },
                    { key: "EXPENSE", label: "Petty Expense (Out)" },
                    { key: "CASH_IN", label: "Float Add (In)" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setMovementType(t.key as any)}
                      className={`py-2 px-1.5 rounded-xl border text-center font-bold transition-all text-[11px] ${
                        movementType === t.key
                          ? "bg-amber text-charcoal border-amber"
                          : "bg-stone-900 text-stone-400 border-stone-800 hover:text-white"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Amount (Rs):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-sm font-mono text-white focus:outline-hidden focus:border-amber"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-300 block mb-1">
                  Reason / Description:
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    movementType === "SAFE_DROP"
                      ? "e.g. Manager cash drop to office safe"
                      : movementType === "EXPENSE"
                      ? "e.g. Kitchen Ice, Milk, Tea, or Rider Fuel"
                      : "e.g. Additional 500Rs coin bundle added"
                  }
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-xs text-white focus:outline-hidden focus:border-amber"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading || !movementAmount || !movementReason.trim()}
                  className="flex-1 py-3 bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Record Transaction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-heading uppercase text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Z-REPORT MODAL & THERMAL PRINT */}
      {zReportShift && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-charcoal border border-stone-700 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden text-white shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-900/90">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber" />
                <h3 className="font-heading text-lg uppercase text-white">
                  Z-Report ({zReportShift.shiftNo || zReportShift.id})
                </h3>
              </div>
              <button
                onClick={() => setZReportShift(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Z-Report Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div
                id="thermal-z-report-area"
                className="bg-white text-black p-4 rounded-xl font-mono text-xs space-y-3 shadow-inner"
              >
                <div className="text-center border-b border-dashed border-stone-400 pb-2.5">
                  <div className="font-bold text-sm tracking-wider uppercase">RIMJHIM PIZZERIA</div>
                  <div className="text-[11px] text-stone-700">Commercial Area, Satellite Town, Bahawalpur</div>
                  <div className="text-[11px] text-stone-700">Phone: 0308-6547672</div>
                  <div className="font-bold text-xs uppercase mt-2 bg-stone-200 py-0.5">
                    *** END OF SHIFT Z-REPORT ***
                  </div>
                  <div className="text-[11px] mt-1 font-bold">
                    Shift: {zReportShift.shiftNo || zReportShift.id}
                  </div>
                  <div className="text-[10px] text-stone-600">
                    Date: {new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>

                <div className="text-[11px] space-y-1 border-b border-dashed border-stone-400 pb-2">
                  <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span className="font-bold">{zReportShift.openedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opened:</span>
                    <span>{new Date(zReportShift.openedAt).toLocaleTimeString()}</span>
                  </div>
                  {zReportShift.closedAt && (
                    <div className="flex justify-between">
                      <span>Closed:</span>
                      <span>{new Date(zReportShift.closedAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                  {zReportShift.ordersCount !== undefined && (
                    <div className="flex justify-between">
                      <span>Orders Processed:</span>
                      <span className="font-bold">{zReportShift.ordersCount}</span>
                    </div>
                  )}
                </div>

                {/* Sales Breakdown by Tender */}
                <div className="space-y-1 border-b border-dashed border-stone-400 pb-2 text-[11px]">
                  <div className="font-bold uppercase text-[10px] text-stone-600">Sales By Payment Method:</div>
                  <div className="flex justify-between">
                    <span>Cash Sales:</span>
                    <span>{formatRupees(zReportShift.cashSales ?? (zReportShift as any).currentCashSales ?? 0)}</span>
                  </div>
                  {zReportShift.cardSales !== undefined && (
                    <div className="flex justify-between">
                      <span>Card / POS Machine:</span>
                      <span>{formatRupees(zReportShift.cardSales)}</span>
                    </div>
                  )}
                  {zReportShift.jazzCashSales !== undefined && zReportShift.jazzCashSales > 0 && (
                    <div className="flex justify-between">
                      <span>JazzCash Wallet:</span>
                      <span>{formatRupees(zReportShift.jazzCashSales)}</span>
                    </div>
                  )}
                  {zReportShift.easyPaisaSales !== undefined && zReportShift.easyPaisaSales > 0 && (
                    <div className="flex justify-between">
                      <span>EasyPaisa Wallet:</span>
                      <span>{formatRupees(zReportShift.easyPaisaSales)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t border-stone-300">
                    <span>TOTAL SALES:</span>
                    <span>
                      {formatRupees(
                        zReportShift.totalSales ??
                          (zReportShift.cashSales ?? (zReportShift as any).currentCashSales ?? 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Sales Breakdown by Channel */}
                {(zReportShift.dineInSales !== undefined || zReportShift.takeawaySales !== undefined || zReportShift.deliverySales !== undefined) && (
                  <div className="space-y-1 border-b border-dashed border-stone-400 pb-2 text-[11px]">
                    <div className="font-bold uppercase text-[10px] text-stone-600">Sales By Order Channel:</div>
                    <div className="flex justify-between">
                      <span>Dine-In ({zReportShift.dineInOrdersCount || 0}):</span>
                      <span>{formatRupees(zReportShift.dineInSales || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Takeaway ({zReportShift.takeawayOrdersCount || 0}):</span>
                      <span>{formatRupees(zReportShift.takeawaySales || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery ({zReportShift.deliveryOrdersCount || 0}):</span>
                      <span>{formatRupees(zReportShift.deliverySales || 0)}</span>
                    </div>
                  </div>
                )}

                {/* Cash Reconciliation */}
                <div className="space-y-1 border-b border-dashed border-stone-400 pb-2 text-[11px]">
                  <div className="font-bold uppercase text-[10px] text-stone-600">Cash Drawer Reconciliation:</div>
                  <div className="flex justify-between">
                    <span>Opening Float:</span>
                    <span>{formatRupees(zReportShift.openingCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Sales:</span>
                    <span>+{formatRupees(zReportShift.cashSales ?? (zReportShift as any).currentCashSales ?? 0)}</span>
                  </div>
                  {((zReportShift.cashInTotal || 0) > 0) && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Cash In / Additions:</span>
                      <span>+{formatRupees(zReportShift.cashInTotal || 0)}</span>
                    </div>
                  )}
                  {((zReportShift.safeDropTotal || 0) > 0) && (
                    <div className="flex justify-between text-amber-800">
                      <span>Safe Drops:</span>
                      <span>-{formatRupees(zReportShift.safeDropTotal || 0)}</span>
                    </div>
                  )}
                  {((zReportShift.expensesTotal || 0) > 0) && (
                    <div className="flex justify-between text-red-700">
                      <span>Petty Cash Expenses:</span>
                      <span>-{formatRupees(zReportShift.expensesTotal || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t border-stone-300">
                    <span>NET EXPECTED IN DRAWER:</span>
                    <span>{formatRupees(zReportShift.expectedCash ?? (zReportShift as any).expectedInDrawer ?? 0)}</span>
                  </div>
                  {zReportShift.countedCash !== undefined && (
                    <div className="flex justify-between font-bold">
                      <span>ACTUAL COUNTED:</span>
                      <span>{formatRupees(zReportShift.countedCash)}</span>
                    </div>
                  )}
                  {zReportShift.countedCash !== undefined && zReportShift.expectedCash !== undefined && (
                    <div className="flex justify-between font-bold pt-1 text-[11px]">
                      <span>VARIANCE / DISCREPANCY:</span>
                      <span className={zReportShift.countedCash - zReportShift.expectedCash < 0 ? "text-red-700" : ""}>
                        {zReportShift.countedCash - zReportShift.expectedCash >= 0 ? "+" : ""}
                        {formatRupees(zReportShift.countedCash - zReportShift.expectedCash)}
                      </span>
                    </div>
                  )}
                </div>

                {zReportShift.notes && (
                  <div className="text-[10px] text-stone-700 border-b border-dashed border-stone-400 pb-2">
                    <span className="font-bold">Remarks: </span>
                    {zReportShift.notes}
                  </div>
                )}

                <div className="text-center pt-2 text-[10px] text-stone-500">
                  <div>Cashier Sign: ______________________</div>
                  <div className="mt-2 text-[9px]">Rimjhim POS Shift Audit System</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-900 flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Z-Report</span>
              </button>
              <button
                onClick={() => setZReportShift(null)}
                className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-heading uppercase text-sm rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print CSS for Thermal Z-Report */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-z-report-area,
          #thermal-z-report-area * {
            visibility: visible !important;
          }
          #thermal-z-report-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 8px !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
