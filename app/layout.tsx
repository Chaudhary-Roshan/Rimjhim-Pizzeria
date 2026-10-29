import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";

export const metadata: Metadata = {
  title: "Rimjhim Pizzeria — Bahawalpur | Best Pizzas, Burgers & Deals",
  description: "Order fresh and piping hot Pizzas, Crispy Burgers, Shawarma, Paratha Rolls, and family deals in Bahawalpur. Fast delivery and pickup in Satellite Town.",
  icons: {
    icon: "/favicon.ico",
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
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased selection:bg-amber-400 selection:text-stone-900">
        <main className="min-h-screen pb-20 md:pb-0">{children}</main>
        <CartDrawer />
        <FloatingCartBar />
      </body>
    </html>
  );
}
