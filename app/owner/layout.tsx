"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MonitorSmartphone,
  BarChart3,
  Users,
  Wallet,
  Bell,
  BellOff,
  Store,
  ExternalLink,
  LogOut,
  User,
} from "lucide-react";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [staff, setStaff] = useState<{ name: string; role: string } | null>(null);

  // Fetch logged in user
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

  // Poll for pending orders count every 5 seconds for tab badge
  useEffect(() => {
    async function checkPending() {
      try {
        const res = await fetch("/api/orders?status=NEW");
        const data = await res.json();
        if (data.success) {
          setPendingOrdersCount(data.count);
          if (data.count > 0) {
            document.title = `(${data.count}) New Orders — Rimjhim Pizzeria`;
          } else {
            document.title = "Owner Panel — Rimjhim Pizzeria";
          }
        }
      } catch {
        // ignore poll errors
      }
    }

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/owner/orders", label: "Live Orders", icon: LayoutDashboard, badge: pendingOrdersCount },
    { href: "/owner/pos", label: "POS Register", icon: MonitorSmartphone },
    { href: "/owner/reports", label: "Sales & Reports", icon: BarChart3 },
    { href: "/owner/customers", label: "Customers CRM", icon: Users },
    { href: "/owner/shifts", label: "Cash Shifts", icon: Wallet },
  ];

  const filteredNavLinks = navLinks.filter((link) => {
    if (staff?.role === "KITCHEN") {
      return link.href === "/owner/orders";
    }
    if (staff?.role === "CASHIER") {
      return link.href !== "/owner/reports";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-charcoal-dark border-b border-stone-800 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/owner/orders" className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <div>
              <div className="font-heading text-xl uppercase tracking-wider text-white">
                Rimjhim <span className="text-amber">Owner Portal</span>
              </div>
              <div className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase">
                Satellite Town Branch
              </div>
            </div>
          </Link>
        </div>

        {/* Global Controls & Staff Account */}
        <div className="flex items-center gap-3">
          {/* Staff Info Pill */}
          {staff && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/60 text-xs">
              <User className="w-3.5 h-3.5 text-amber" />
              <span className="font-semibold text-stone-200">{staff.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber/20 text-amber font-mono font-bold">
                {staff.role}
              </span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? "bg-amber/20 border-amber text-amber"
                : "bg-stone-800 border-stone-700 text-stone-400"
            }`}
            title={soundEnabled ? "Order sound alerts enabled" : "Sound muted"}
          >
            {soundEnabled ? <Bell className="w-4 h-4 animate-bounce" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Muted"}</span>
          </button>

          {/* Quick link to customer ordering site */}
          <Link
            href="/"
            target="_blank"
            className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-stone-700 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-freshLime" />
            <span className="hidden sm:inline">Customer Site</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
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

      {/* Navigation Bar */}
      <nav className="bg-charcoal border-b border-stone-800 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {filteredNavLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 py-3 px-4 font-heading uppercase text-sm tracking-wider border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-amber text-amber font-bold bg-stone-800/50"
                  : "border-transparent text-stone-400 hover:text-white hover:bg-stone-800/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
              {typeof link.badge === "number" && link.badge > 0 && (
                <span className="bg-rimjhimRed text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Main Content Body */}
      <div className="flex-1 p-4 sm:p-6 overflow-x-auto bg-stone-950">
        {children}
      </div>
    </div>
  );
}
