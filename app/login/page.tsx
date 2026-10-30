"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Store,
  Delete,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/owner/orders";

  const [mode, setMode] = useState<"pin" | "credentials">("pin");
  const [pin, setPin] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Keyboard support for PIN entry
  useEffect(() => {
    if (mode !== "pin") return;

    function handleKeyDown(e: KeyboardEvent) {
      if (loading || success) return;
      if (e.key >= "0" && e.key <= "9") {
        setPin((prev) => (prev.length < 4 ? prev + e.key : prev));
      } else if (e.key === "Backspace") {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === "Enter" && pin.length === 4) {
        submitPin(pin);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, pin, loading, success]);

  // Auto-submit PIN when 4 digits reached
  useEffect(() => {
    if (pin.length === 4) {
      submitPin(pin);
    }
  }, [pin]);

  async function submitPin(pinToSubmit: string) {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinToSubmit }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid PIN. Please try again.");
        setPin("");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 500);
    } catch {
      setError("Connection error. Please try again.");
      setPin("");
      setLoading(false);
    }
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid phone or password.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 500);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  function handleKeypadClick(digit: string) {
    if (loading || success) return;
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  }

  function handleBackspace() {
    if (loading || success) return;
    setPin((prev) => prev.slice(0, -1));
  }

  function handleClear() {
    if (loading || success) return;
    setPin("");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Header */}
      <div className="w-full max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
          <div className="w-12 h-12 rounded-full bg-rimjhimRed flex items-center justify-center text-2xl shadow-xl group-hover:scale-105 transition-transform">
            🍕
          </div>
          <div className="text-left">
            <h1 className="font-heading text-2xl uppercase tracking-wider leading-none text-white">
              Rimjhim <span className="text-amber">Pizzeria</span>
            </h1>
            <p className="text-xs text-stone-400 font-semibold tracking-widest uppercase">
              Bahawalpur
            </p>
          </div>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-xs font-medium text-stone-300">
          <Lock className="w-3.5 h-3.5 text-amber" />
          <span>Staff & Management Portal</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Mode Selector Tabs */}
        <div className="flex bg-stone-950 p-1 rounded-2xl mb-6 border border-stone-800/80">
          <button
            type="button"
            onClick={() => {
              setMode("pin");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-heading uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "pin"
                ? "bg-amber text-charcoal font-bold shadow-md"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-4 h-4" /> Quick POS PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("credentials");
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-heading uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "credentials"
                ? "bg-amber text-charcoal font-bold shadow-md"
                : "text-stone-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" /> Phone & Password
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-700/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authenticated! Redirecting to portal...</span>
          </div>
        )}

        {/* PIN Entry Mode */}
        {mode === "pin" && (
          <div>
            <p className="text-center text-xs text-stone-400 mb-4">
              Enter your 4-digit staff PIN on the keypad or keyboard
            </p>

            {/* PIN Dots Display */}
            <div className="flex justify-center items-center gap-4 mb-6">
              {[0, 1, 2, 3].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? "bg-amber scale-125 shadow-[0_0_12px_rgba(248,172,50,0.6)]"
                        : "bg-stone-800 border border-stone-700"
                    }`}
                  />
                );
              })}
            </div>

            {/* Touch Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadClick(digit)}
                  disabled={loading || success}
                  className="h-14 rounded-2xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-white font-heading text-2xl font-bold transition-all border border-stone-700/60 flex items-center justify-center focus:outline-none"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                disabled={loading || success}
                className="h-14 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-400 text-xs font-semibold uppercase tracking-wider transition-all border border-stone-800 flex items-center justify-center focus:outline-none"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleKeypadClick("0")}
                disabled={loading || success}
                className="h-14 rounded-2xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-white font-heading text-2xl font-bold transition-all border border-stone-700/60 flex items-center justify-center focus:outline-none"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                disabled={loading || success}
                className="h-14 rounded-2xl bg-stone-900 hover:bg-stone-800 active:scale-95 text-stone-400 transition-all border border-stone-800 flex items-center justify-center focus:outline-none"
                aria-label="Delete"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Credentials Form Mode */}
        {mode === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Staff Phone Number
              </label>
              <input
                type="text"
                placeholder="03XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-sm tracking-wider font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                "Signing In..."
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Secure Access Notice */}
        <div className="mt-6 pt-5 border-t border-stone-800 text-center">
          <p className="text-[11px] text-stone-500 font-medium">
            Authorized staff only. For security, sign-in access is restricted to verified credentials.
          </p>
        </div>
      </div>

      {/* Back to Customer Site */}
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <Store className="w-3.5 h-3.5 text-freshLime" />
          <span>Back to Customer Website</span>
        </Link>
      </div>

      {/* Developer Attribution */}
      <div className="mt-4 text-[11px] text-stone-500 text-center">
        This website is developed by <strong className="text-stone-400 font-semibold">Muhammad Roshan Ashraf</strong> (0303-7357002)
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400 text-sm">
          Loading Staff Sign In...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

