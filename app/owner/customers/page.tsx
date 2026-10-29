"use client";

import { useState, useEffect } from "react";
import { CustomerRecord } from "@/lib/mock-db";
import { formatRupees, formatPhone } from "@/lib/format";
import { Search, User, Phone, ShieldAlert, CheckCircle, MapPin } from "lucide-react";

export default function CustomersCrmPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data.success) {
          setCustomers(data.customers);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-5 rounded-2xl border border-stone-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl uppercase tracking-wider text-white">
            Customer Directory (CRM)
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Every online and POS customer profile created automatically from their phone number.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by phone or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-amber"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-charcoal rounded-2xl border border-stone-800 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-900 border-b border-stone-800 font-heading uppercase text-stone-400 text-[11px] tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4">Total Spent</th>
                <th className="p-4">Last Order</th>
                <th className="p-4">Last Known Address</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    No customers found in record
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.phone} className="hover:bg-stone-800/40 transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-amber">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-4 font-mono font-medium text-stone-200">
                      {formatPhone(c.phone)}
                    </td>
                    <td className="p-4 font-heading text-sm text-stone-100">
                      {c.ordersCount}
                    </td>
                    <td className="p-4 font-heading text-sm text-amber font-bold">
                      {formatRupees(c.totalSpent)}
                    </td>
                    <td className="p-4 text-stone-400">
                      {new Date(c.lastOrderAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-stone-400 max-w-xs truncate">
                      {c.lastAddress || "Counter Pickup"}
                    </td>
                    <td className="p-4">
                      {c.isBlocked ? (
                        <span className="inline-flex items-center gap-1 bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <ShieldAlert className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
