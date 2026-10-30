import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export const metadata: Metadata = {
  title: "Rimjhim Pizzeria — Bahawalpur | Best Pizzas, Burgers & Deals",
  description: "Order fresh and piping hot Pizzas, Crispy Burgers, Shawarma, Paratha Rolls, and family deals in Bahawalpur. Fast delivery and pickup in Satellite Town.",
  applicationName: "Rimjhim Pizzeria",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Rimjhim",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#DD2928",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased selection:bg-amber-400 selection:text-stone-900">
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <CartDrawer />
        <FloatingCartBar />
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
