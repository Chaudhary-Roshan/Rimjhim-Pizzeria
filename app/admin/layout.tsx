"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ShieldCheck,
  Percent,
  MapPin,
  Settings,
  Store,
  LogOut,
  User,
  MonitorSmartphone,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [staff, setStaff] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.authenticated) {
          setStaff(data.user);
        }
      } catch {
        // ignore
      }
    }
    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const navTabs = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/menu", label: "Menu & Items", icon: UtensilsCrossed },
    { href: "/admin/customers", label: "Customers CRM", icon: Users },
    { href: "/admin/staff", label: "Staff & PINs", icon: ShieldCheck },
    { href: "/admin/prices", label: "Bulk Prices", icon: Percent },
    { href: "/admin/zones", label: "Delivery Areas", icon: MapPin },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber selection:text-charcoal">
      {/* Top Header */}
      <header className="bg-charcoal/95 backdrop-blur-md border-b border-stone-800/80 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rimjhimRed to-amber flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🍕
            </div>
            <div>
              <div className="font-heading text-lg sm:text-xl uppercase tracking-wider text-white leading-none flex items-center gap-2">
                <span>Rimjhim</span>
                <span className="text-[11px] font-mono font-bold bg-rimjhimRed text-white px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Admin
                </span>
              </div>
              <div className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase mt-0.5">
                Executive Store Control
              </div>
            </div>
          </Link>
        </div>

        {/* Global Controls & Staff Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Staff Info Pill */}
          {staff && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs">
              <User className="w-3.5 h-3.5 text-amber" />
              <span className="font-semibold text-stone-200">{staff.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-rimjhimRed/20 text-rimjhimRed border border-rimjhimRed/30 font-mono font-bold">
                {staff.role}
              </span>
            </div>
          )}

          {/* Quick link to Owner live orders & POS */}
          <Link
            href="/owner/orders"
            className="text-xs bg-stone-900 hover:bg-stone-800 text-amber border border-stone-800 hover:border-amber/40 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            title="Open Live Kitchen Kanban"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber" />
            <span className="hidden sm:inline font-semibold">Live Orders</span>
          </Link>

          <Link
            href="/owner/pos"
            className="text-xs bg-stone-900 hover:bg-stone-800 text-freshLime border border-stone-800 hover:border-freshLime/40 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            title="Open Touch POS Register"
          >
            <MonitorSmartphone className="w-3.5 h-3.5 text-freshLime" />
            <span className="hidden sm:inline font-semibold">POS Register</span>
          </Link>

          {/* Quick link to customer ordering site */}
          <Link
            href="/"
            target="_blank"
            className="text-xs bg-stone-900 hover:bg-stone-800 text-stone-300 px-3 py-2 rounded-xl border border-stone-800 hover:border-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden md:inline">Customer Site</span>
            <ExternalLink className="w-3 h-3 text-stone-500" />
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="text-xs bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Sign Out of Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Modern Navigation Tabs Bar */}
      <nav className="bg-charcoal border-b border-stone-800/90 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none sticky top-16 z-20 shadow-xs">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 py-3 px-4 font-heading uppercase text-xs sm:text-sm tracking-wider border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-amber text-amber font-bold bg-stone-900/60"
                  : "border-transparent text-stone-400 hover:text-white hover:bg-stone-900/30"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber" : "text-stone-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
