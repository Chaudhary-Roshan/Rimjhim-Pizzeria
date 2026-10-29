"use client";

import { useState, useEffect } from "react";
import { formatRupees } from "@/lib/format";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  FileEdit,
  History,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  X,
  Loader2,
  Check,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Customer {
  phone: string;
  name: string;
  ordersCount: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
  lastAddress?: string;
  isBlocked: boolean;
  notes?: string;
}

interface OrderHistoryItem {
  id: string;
  orderNo: string;
  status: string;
  total: number;
  type: string;
  channel: string;
  createdAt: string;
  items: {
    name: string;
    variantName?: string;
    quantity: number;
  }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "VIP" | "REPEAT" | "BLOCKED">("ALL");
  const [toastMessage, setToastMessage] = useState("");

  // Notes Modal state
  const [activeNotesCustomer, setActiveNotesCustomer] = useState<Customer | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Orders History Modal state
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.success && data.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Toggle Block/Unblock
  const handleToggleBlock = async (customer: Customer) => {
    const actionLabel = customer.isBlocked ? "Unblock" : "Block";
    if (
      !confirm(
        `Are you sure you want to ${actionLabel.toLowerCase()} ${customer.name} (${customer.phone})?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/customers/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleBlock",
          phone: customer.phone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.phone === customer.phone ? { ...c, isBlocked: !c.isBlocked } : c
          )
        );
        showToast(
          customer.isBlocked
            ? `Customer ${customer.name} unblocked successfully!`
            : `Customer ${customer.name} has been BLOCKED from ordering.`
        );
      } else {
        alert(data.message || "Failed to update customer status");
      }
    } catch {
      alert("Error contacting server. Please try again.");
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    if (!activeNotesCustomer) return;
    setSavingNotes(true);

    try {
      const res = await fetch("/api/customers/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateNotes",
          phone: activeNotesCustomer.phone,
          notes: notesInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.phone === activeNotesCustomer.phone ? { ...c, notes: notesInput } : c
          )
        );
        showToast(`Internal notes for ${activeNotesCustomer.name} updated.`);
        setActiveNotesCustomer(null);
      } else {
        alert(data.message || "Failed to save notes");
      }
    } catch {
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // View Order History
  const handleViewOrders = async (customer: Customer) => {
    setHistoryCustomer(customer);
    setLoadingOrders(true);
    setCustomerOrders([]);

    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(customer.phone)}`);
      const data = await res.json();
      if (data.success && data.orders) {
        setCustomerOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load customer orders", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Calculations for KPI Cards
  const totalCustomers = customers.length;
  const vipCustomers = customers.filter((c) => c.totalSpent >= 5000).length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const blockedCount = customers.filter((c) => c.isBlocked).length;

  // Filter & Search
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.lastAddress && c.lastAddress.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q));

    if (!matchSearch) return false;

    if (filter === "VIP") return c.totalSpent >= 5000;
    if (filter === "REPEAT") return c.ordersCount >= 2;
    if (filter === "BLOCKED") return c.isBlocked;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
              Customer CRM Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber/20 text-amber border border-amber/30">
              {customers.length} Profiles
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Track repeat guests, identify VIP buyers, record preferences, and safeguard against fraud or spam.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-charcoal p-4 rounded-2xl border border-stone-800 space-y-1">
          <div className="text-[11px] font-mono uppercase text-stone-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber" />
            <span>Total Customers</span>
          </div>
          <div className="font-heading text-2xl text-white font-bold">{totalCustomers}</div>
          <div className="text-[10px] text-stone-500">Registered across Online & POS</div>
        </div>

        <div className="bg-charcoal p-4 rounded-2xl border border-stone-800 space-y-1">
          <div className="text-[11px] font-mono uppercase text-stone-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber" />
            <span>VIP Spenders</span>
          </div>
          <div className="font-heading text-2xl text-amber font-bold">{vipCustomers}</div>
          <div className="text-[10px] text-stone-500">Spent &gt; Rs 5,000 lifetime</div>
        </div>

        <div className="bg-charcoal p-4 rounded-2xl border border-stone-800 space-y-1">
          <div className="text-[11px] font-mono uppercase text-stone-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total Lifetime Sales</span>
          </div>
          <div className="font-heading text-2xl text-emerald-400 font-bold">
            {formatRupees(totalRevenue)}
          </div>
          <div className="text-[10px] text-stone-500">From customer orders</div>
        </div>

        <div className="bg-charcoal p-4 rounded-2xl border border-stone-800 space-y-1">
          <div className="text-[11px] font-mono uppercase text-stone-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rimjhimRed" />
            <span>Blocked / Flagged</span>
          </div>
          <div className="font-heading text-2xl text-rimjhimRed font-bold">{blockedCount}</div>
          <div className="text-[10px] text-stone-500">Restricted from ordering</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-charcoal p-4 rounded-2xl border border-stone-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, address, or note..."
            className="w-full bg-stone-900 border border-stone-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl font-heading uppercase font-semibold transition-colors whitespace-nowrap ${
              filter === "ALL"
                ? "bg-amber text-charcoal shadow-sm"
                : "bg-stone-900 text-stone-300 hover:bg-stone-800"
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilter("VIP")}
            className={`px-3 py-1.5 rounded-xl font-heading uppercase font-semibold transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === "VIP"
                ? "bg-amber text-charcoal shadow-sm"
                : "bg-stone-900 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <Star className="w-3 h-3" />
            VIP Spenders ({vipCustomers})
          </button>
          <button
            onClick={() => setFilter("REPEAT")}
            className={`px-3 py-1.5 rounded-xl font-heading uppercase font-semibold transition-colors whitespace-nowrap ${
              filter === "REPEAT"
                ? "bg-amber text-charcoal shadow-sm"
                : "bg-stone-900 text-stone-300 hover:bg-stone-800"
            }`}
          >
            Repeat Buyers ({customers.filter((c) => c.ordersCount >= 2).length})
          </button>
          <button
            onClick={() => setFilter("BLOCKED")}
            className={`px-3 py-1.5 rounded-xl font-heading uppercase font-semibold transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === "BLOCKED"
                ? "bg-rimjhimRed text-white shadow-sm"
                : "bg-stone-900 text-stone-300 hover:bg-stone-800"
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Blocked ({blockedCount})
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-charcoal rounded-2xl border border-stone-800 overflow-hidden shadow-lg">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber animate-spin mx-auto" />
            <p className="text-xs text-stone-400">Loading customer profiles...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-stone-600 mx-auto" />
            <div className="font-heading text-base text-stone-300 uppercase">No customers found</div>
            <p className="text-xs text-stone-500">
              Try adjusting your search criteria or filter to see more profiles.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900 border-b border-stone-800 font-heading uppercase text-stone-400 text-[11px] tracking-wider">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Phone & WhatsApp</th>
                  <th className="p-4">Orders & Spend</th>
                  <th className="p-4">Last Order</th>
                  <th className="p-4">Delivery Address</th>
                  <th className="p-4">Internal Notes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredCustomers.map((customer) => {
                  const isVip = customer.totalSpent >= 5000;
                  const avgSpend =
                    customer.ordersCount > 0
                      ? Math.round(customer.totalSpent / customer.ordersCount)
                      : 0;

                  return (
                    <tr
                      key={customer.phone}
                      className={`hover:bg-stone-800/40 transition-colors ${
                        customer.isBlocked ? "bg-red-950/15" : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-heading font-bold text-sm shadow-xs ${
                              isVip
                                ? "bg-amber/20 text-amber border border-amber/40"
                                : "bg-stone-800 text-stone-300 border border-stone-700"
                            }`}
                          >
                            {customer.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{customer.name}</span>
                              {isVip && (
                                <span className="bg-amber/20 text-amber text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border border-amber/30">
                                  ★ VIP
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              First visited: {new Date(customer.firstOrderAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & WhatsApp */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="font-mono text-stone-200 font-semibold flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span>{customer.phone}</span>
                          </div>
                          <a
                            href={`https://wa.me/92${customer.phone.replace(/^0/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <span>WhatsApp Chat</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </td>

                      {/* Orders & Spend */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">
                              {formatRupees(customer.totalSpent)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-800 border border-stone-700 font-mono text-stone-300">
                              {customer.ordersCount} {customer.ordersCount === 1 ? "order" : "orders"}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            Avg: {formatRupees(avgSpend)} / order
                          </div>
                        </div>
                      </td>

                      {/* Last Order Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-stone-300">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          <span>{new Date(customer.lastOrderAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {new Date(customer.lastOrderAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* Address */}
                      <td className="p-4 max-w-xs">
                        {customer.lastAddress ? (
                          <div className="flex items-start gap-1.5 text-stone-300">
                            <MapPin className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                            <span className="line-clamp-2 text-[11px] leading-tight">
                              {customer.lastAddress}
                            </span>
                          </div>
                        ) : (
                          <span className="text-stone-500 text-[11px] italic">
                            Counter / Dine-In / None
                          </span>
                        )}
                      </td>

                      {/* Internal Notes */}
                      <td className="p-4 max-w-xs">
                        {customer.notes ? (
                          <button
                            onClick={() => {
                              setActiveNotesCustomer(customer);
                              setNotesInput(customer.notes || "");
                            }}
                            className="text-left group flex items-start gap-1 text-[11px] text-amber/90 hover:text-amber bg-amber/5 border border-amber/20 hover:border-amber/40 p-1.5 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 text-amber shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{customer.notes}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveNotesCustomer(customer);
                              setNotesInput("");
                            }}
                            className="text-[10px] text-stone-500 hover:text-stone-300 underline decoration-dotted"
                          >
                            + Add note
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {customer.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rimjhimRed/20 text-rimjhimRed border border-rimjhimRed/30">
                            <ShieldAlert className="w-3 h-3" />
                            BLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Order History */}
                          <button
                            onClick={() => handleViewOrders(customer)}
                            title="View Orders History"
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Edit Notes */}
                          <button
                            onClick={() => {
                              setActiveNotesCustomer(customer);
                              setNotesInput(customer.notes || "");
                            }}
                            title="Edit Internal Notes"
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>

                          {/* Block/Unblock Button */}
                          <button
                            onClick={() => handleToggleBlock(customer)}
                            title={customer.isBlocked ? "Unblock Customer" : "Block Customer"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              customer.isBlocked
                                ? "bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300"
                                : "bg-rimjhimRed/20 hover:bg-rimjhimRed text-rimjhimRed hover:text-white"
                            }`}
                          >
                            {customer.isBlocked ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <ShieldAlert className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Notes Modal */}
      {activeNotesCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal border border-stone-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-amber" />
                <h3 className="font-heading text-lg text-white uppercase">Internal Staff Notes</h3>
              </div>
              <button
                onClick={() => setActiveNotesCustomer(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-400 space-y-1">
              <div>
                Customer: <strong className="text-white">{activeNotesCustomer.name}</strong> (
                {activeNotesCustomer.phone})
              </div>
              <p className="text-[11px] text-stone-500">
                These notes are visible to order counters and delivery staff (e.g. food allergies, preferred condiments, buzzer instructions).
              </p>
            </div>

            <textarea
              rows={4}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. Likes extra garlic sauce. VIP regular from Model Town. Please deliver via rear gate."
              className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveNotesCustomer(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-amber hover:bg-amber/90 text-charcoal font-heading uppercase text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Orders History Modal */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-charcoal border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber" />
                <div>
                  <h3 className="font-heading text-lg text-white uppercase leading-none">
                    Order History: {historyCustomer.name}
                  </h3>
                  <div className="text-[11px] text-stone-400 mt-1 font-mono">
                    {historyCustomer.phone} • {formatRupees(historyCustomer.totalSpent)} lifetime spend
                  </div>
                </div>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
              {loadingOrders ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-amber animate-spin mx-auto" />
                  <p className="text-stone-400 text-xs">Loading order receipts...</p>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="py-12 text-center text-stone-500">
                  No previous orders on record for this phone number.
                </div>
              ) : (
                customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-xl bg-stone-900 border border-stone-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber">{ord.orderNo}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-300">
                          {ord.type}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-400">
                          {ord.channel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {formatRupees(ord.total)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            ord.status === "COMPLETED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : ord.status === "CANCELLED"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : "bg-amber/20 text-amber border border-amber/30"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      <span>{new Date(ord.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="bg-charcoal/80 p-2.5 rounded-lg border border-stone-800 text-[11px] text-stone-300 space-y-1">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            {it.quantity}x {it.name}{" "}
                            {it.variantName ? `(${it.variantName})` : ""}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-1">
                      <Link
                        href={`/order/${ord.orderNo}`}
                        target="_blank"
                        className="text-[10px] text-amber hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>View Customer Receipt</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

