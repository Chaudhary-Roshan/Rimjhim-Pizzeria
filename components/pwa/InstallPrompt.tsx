"use client";

import { useState, useEffect } from "react";
import { Download, X, Share2, Smartphone } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    if (typeof window !== "undefined") {
      const isApp =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isApp);

      // Check if iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      const iOS = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(iOS);

      // Check if user dismissed previously in this session
      const isDismissed = sessionStorage.getItem("rimjhim_install_dismissed");
      if (isDismissed) setDismissed(true);

      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstall);

      window.addEventListener("appinstalled", () => {
        setIsInstallable(false);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("rimjhim_install_dismissed", "true");
    }
  };

  // Don't render if already in app or dismissed
  if (isStandalone || dismissed) return null;

  // Render Android / Chrome / Edge install prompt
  if (isInstallable) {
    return (
      <aside
        aria-label="Install app banner"
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-charcoal border border-amber/30 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300 backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-rimjhimRed flex items-center justify-center text-xl shrink-0 shadow-md">
            🍕
          </div>
          <div>
            <h4 className="font-heading uppercase text-sm leading-tight text-white font-bold">
              Install Rimjhim App
            </h4>
            <p className="text-[11px] text-stone-300 mt-0.5">
              1-tap ordering, live order alerts & offline menu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 bg-amber hover:bg-amber-dark text-charcoal font-heading uppercase text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-stone-400 hover:text-white transition-colors"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  // Render iOS Safari Add to Home Screen tip (shown once on iOS non-standalone)
  if (isIOS && !dismissed) {
    return (
      <aside
        aria-label="iOS add to home screen banner"
        className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 bg-charcoal border border-amber/30 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rimjhimRed flex items-center justify-center text-lg shrink-0">
            🍕
          </div>
          <div className="text-xs">
            <span className="font-heading uppercase font-bold text-white block">
              Add Rimjhim to Home Screen
            </span>
            <span className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5">
              Tap <Share2 className="w-3 h-3 text-sky-400 inline" /> then &quot;Add to Home Screen&quot;
            </span>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-stone-400 hover:text-white"
          aria-label="Close iOS install tip"
        >
          <X className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return null;
}

