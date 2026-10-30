"use client";

import { useState, useEffect, useRef } from "react";
import { OrderRecord } from "@/lib/mock-db";
import { formatRupees, formatPhone } from "@/lib/format";
import {
  Clock,
  Phone,
  MessageSquare,
  Bike,
  Store,
  Printer,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ExternalLink,
  ChefHat,
  PackageCheck,
  RefreshCw,
} from "lucide-react";

export default function OwnerLiveOrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterChannel, setFilterChannel] = useState<string>("ALL");
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState("");

  const prevPendingCountRef = useRef(0);

  // Play audio chime for new orders
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        const newCount = data.orders.filter((o: OrderRecord) => o.status === "NEW").length;
        if (newCount > prevPendingCountRef.current) {
          playChime();
        }
        prevPendingCountRef.current = newCount;
      }
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // SSE connection for real-time order drop-ins
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource("/api/stream/orders");
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === "order.created" || parsed.event === "order.updated") {
            fetchOrders();
          }
        } catch {
          // ignore keepalive
        }
      };
    } catch {
      // fallback to polling
    }

    // Polling fallback every 6 seconds
    const interval = setInterval(fetchOrders, 6000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleUpdateStatus = async (
    id: string,
    nextStatus: OrderRecord["status"],
    etaMinutes?: number
  ) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, etaMinutes }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: nextStatus, etaMinutes: etaMinutes ?? o.etaMinutes } : o))
        );
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrderId) return;
    try {
      await fetch(`/api/orders/${cancellingOrderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", cancelReason: cancelReasonInput || "Cancelled by owner" }),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancellingOrderId
            ? { ...o, status: "CANCELLED", cancelReason: cancelReasonInput }
            : o
        )
      );
      setCancellingOrderId(null);
      setCancelReasonInput("");
    } catch (e) {
      console.error("Failed to cancel order", e);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filterType !== "ALL" && o.type !== filterType) return false;
    if (filterChannel !== "ALL" && o.channel !== filterChannel) return false;
    return true;
  });

  const columns: { title: string; status: OrderRecord["status"][]; color: string }[] = [
    { title: "New Orders", status: ["NEW"], color: "border-amber text-amber" },
    { title: "In Kitchen", status: ["CONFIRMED", "PREPARING"], color: "border-blue-400 text-blue-400" },
    { title: "Ready / Out", status: ["READY", "OUT_FOR_DELIVERY"], color: "border-purple-400 text-purple-400" },
    { title: "Completed Today", status: ["COMPLETED"], color: "border-emerald-400 text-emerald-400" },
  ];

  const handlePrint = (order: OrderRecord) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Live Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal p-4 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-freshLime animate-ping" />
          <h1 className="font-heading text-xl sm:text-2xl uppercase tracking-wider text-white">
            Live Kitchen & Orders Board
          </h1>
          <span className="bg-stone-800 text-stone-300 text-xs px-2.5 py-1 rounded-full font-semibold">
            {orders.length} Total Today
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-stone-800 border border-stone-700 text-white rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-amber"
          >
            <option value="ALL">All Types</option>
            <option value="DELIVERY">Delivery Only</option>
            <option value="TAKEAWAY">Takeaway Only</option>
            <option value="DINE_IN">Dine-In Only</option>
          </select>

          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="bg-stone-800 border border-stone-700 text-white rounded-lg px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-amber"
          >
            <option value="ALL">Online & POS</option>
            <option value="ONLINE">Online Orders</option>
            <option value="POS">POS Counter</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => col.status.includes(o.status));

          return (
            <div
              key={col.title}
              className="bg-stone-900 rounded-2xl border border-stone-800 flex flex-col max-h-[85vh]"
            >
              {/* Column Header */}
              <div
                className={`p-3.5 border-b border-stone-800 flex items-center justify-between font-heading uppercase text-sm tracking-wider ${col.color}`}
              >
                <span>{col.title}</span>
                <span className="bg-stone-800 px-2 py-0.5 rounded-full text-xs font-bold text-stone-300">
                  {colOrders.length}
                </span>
              </div>

              {/* Column Cards */}
              <div className="p-3 overflow-y-auto space-y-3 flex-1">
                {colOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-600">
                    No orders in this stage
                  </div>
                ) : (
                  colOrders.map((order) => {
                    // Calculate age in minutes
                    const ageMins = Math.floor(
                      (Date.now() - new Date(order.createdAt).getTime()) / 60000
                    );
                    const isOld = ageMins > 25;
                    const isMedium = ageMins > 10;

                    return (
                      <div
                        key={order.id}
                        className={`bg-charcoal rounded-xl border p-4 text-white space-y-3 transition-all shadow-md ${
                          order.status === "NEW"
                            ? "border-amber ring-1 ring-amber/50 animate-in fade-in"
                            : "border-stone-800 hover:border-stone-700"
                        }`}
                      >
                        {/* Card Top: Number, Timer, Badges */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-heading text-lg tracking-wide uppercase text-white flex items-center gap-2">
                              <span>#{order.orderNo}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  order.channel === "ONLINE"
                                    ? "bg-emerald-900/80 text-emerald-300 border border-emerald-700"
                                    : "bg-blue-900/80 text-blue-300 border border-blue-700"
                                }`}
                              >
                                {order.channel}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                              <span className="flex items-center gap-1 font-semibold">
                                {order.type === "DELIVERY" ? (
                                  <Bike className="w-3.5 h-3.5 text-rimjhimRed" />
                                ) : (
                                  <Store className="w-3.5 h-3.5 text-amber" />
                                )}
                                {order.type}
                              </span>
                              <span>•</span>
                              <span
                                className={`flex items-center gap-1 font-mono text-[11px] font-bold ${
                                  isOld
                                    ? "text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded"
                                    : isMedium
                                    ? "text-amber-400"
                                    : "text-stone-400"
                                }`}
                              >
                                <Clock className="w-3 h-3" /> {ageMins}m ago
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handlePrint(order)}
                            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700"
                            title="Print 80mm Receipt / Ticket"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>

                        {/* First Time Customer Alert */}
                        {order.isFirstOrder && (
                          <div className="bg-red-950/60 border border-red-800/80 rounded-lg p-2 text-xs text-red-300 flex items-center gap-2 font-medium">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>New customer! Call to confirm address.</span>
                          </div>
                        )}

                        {/* Customer Information */}
                        <div className="bg-stone-900/80 rounded-lg p-2.5 text-xs space-y-1 border border-stone-800/60">
                          <div className="font-semibold text-stone-200 flex items-center justify-between">
                            <span>{order.customerName}</span>
                            <span className="font-mono text-stone-400">
                              {formatPhone(order.customerPhone)}
                            </span>
                          </div>

                          {order.address && (
                            <div className="text-stone-400 flex items-start gap-1 pt-1 border-t border-stone-800">
                              <MapPin className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                              <div className="line-clamp-2">
                                {order.address} {order.landmark && `(Near: ${order.landmark})`}
                              </div>
                            </div>
                          )}

                          {/* Fast Action Buttons */}
                          <div className="flex items-center gap-2 pt-1.5">
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-200 px-2 py-1 rounded flex items-center gap-1 font-semibold"
                            >
                              <Phone className="w-3 h-3 text-rimjhimRed" /> Call
                            </a>
                            <a
                              href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(order.customerName)},%20Rimjhim%20Pizzeria%20here%20regarding%20order%20%23${order.orderNo}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-2 py-1 rounded flex items-center gap-1 font-semibold"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          </div>
                        </div>

                        {/* Items Snapshot */}
                        <div className="divide-y divide-stone-800/60 text-xs text-stone-300">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2 flex justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-bold text-white leading-tight">
                                  {item.quantity}x {item.name}
                                  {item.variantName && item.variantName !== "Regular" && item.variantName !== "Standard" && (
                                    <span className="text-amber text-[11px] ml-1">
                                      ({item.variantName})
                                    </span>
                                  )}
                                </div>
                                {item.dealComponents && item.dealComponents.length > 0 && (
                                  <div className="mt-1 bg-stone-900 border border-amber/30 rounded p-1.5 text-[11px] text-amber-200 space-y-0.5">
                                    <span className="font-bold text-[10px] text-amber uppercase block tracking-wider">
                                      🎁 Bundle Includes:
                                    </span>
                                    {item.dealComponents.map((c, ci) => (
                                      <div key={ci} className="text-stone-300 font-medium">
                                        • {c}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!item.dealComponents && item.note && (
                                  <div className="text-[10px] text-stone-400 italic mt-0.5">
                                    {item.note}
                                  </div>
                                )}
                                {item.modifiers?.map((m, mi) => (
                                  <div key={mi} className="text-stone-400 text-[10px] mt-0.5">
                                    • {m.group ? `${m.group}: ` : ""}{m.option}
                                  </div>
                                ))}
                              </div>
                              <span className="font-semibold text-stone-300 shrink-0">
                                {formatRupees(item.lineTotal)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Financial Total */}
                        <div className="flex items-center justify-between border-t border-stone-800 pt-2 text-xs">
                          <span className="text-stone-400">Total Payable:</span>
                          <span className="font-heading text-lg text-amber font-bold">
                            {formatRupees(order.total)}
                          </span>
                        </div>

                        {/* Stage Progression Buttons */}
                        <div className="pt-2 border-t border-stone-800/80 space-y-2">
                          {order.status === "NEW" && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] text-stone-400 font-semibold block">
                                Accept Order with ETA:
                              </span>
                              <div className="grid grid-cols-3 gap-1.5 text-xs">
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "CONFIRMED", 25)}
                                  className="bg-amber hover:bg-amber-dark text-charcoal font-bold py-1.5 rounded-lg font-heading uppercase text-xs"
                                >
                                  25 Mins
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "CONFIRMED", 35)}
                                  className="bg-amber hover:bg-amber-dark text-charcoal font-bold py-1.5 rounded-lg font-heading uppercase text-xs"
                                >
                                  35 Mins
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, "CONFIRMED", 45)}
                                  className="bg-amber hover:bg-amber-dark text-charcoal font-bold py-1.5 rounded-lg font-heading uppercase text-xs"
                                >
                                  45 Mins
                                </button>
                              </div>
                            </div>
                          )}

                          {order.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading uppercase text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold"
                            >
                              <ChefHat className="w-3.5 h-3.5" /> Start Kitchen Prep
                            </button>
                          )}

                          {order.status === "PREPARING" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  order.id,
                                  order.type === "DELIVERY" ? "OUT_FOR_DELIVERY" : "READY"
                                )
                              }
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-heading uppercase text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold"
                            >
                              {order.type === "DELIVERY" ? (
                                <>
                                  <Bike className="w-3.5 h-3.5" /> Hand to Delivery Rider
                                </>
                              ) : (
                                <>
                                  <Store className="w-3.5 h-3.5" /> Ready at Counter
                                </>
                              )}
                            </button>
                          )}

                          {(order.status === "OUT_FOR_DELIVERY" || order.status === "READY") && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading uppercase text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered / Paid
                            </button>
                          )}

                          {/* Cancellation Button */}
                          {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                            <button
                              onClick={() => setCancellingOrderId(order.id)}
                              className="w-full text-stone-500 hover:text-red-400 text-[11px] py-1 transition-colors flex items-center justify-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Order Dialog */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-charcoal border border-stone-700 rounded-2xl max-w-sm w-full p-6 text-white space-y-4">
            <h3 className="font-heading text-xl uppercase text-red-400">Cancel Order</h3>
            <p className="text-xs text-stone-300">
              Please enter the reason for cancellation (e.g. fake order, customer requested, out of ingredients):
            </p>
            <input
              type="text"
              placeholder="Cancellation reason..."
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-red-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingOrderId(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300"
              >
                Back
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 rounded-xl bg-rimjhimRed hover:bg-rimjhimRed-dark text-xs font-semibold text-white"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Thermal Receipt Print Container (80mm) */}
      {printingOrder && (
        <div id="thermal-receipt-print-area" className="hidden print:block text-black bg-white p-2 text-xs font-mono">
          <div className="text-center pb-2 border-b border-black">
            <div className="font-bold text-sm uppercase">RIMJHIM PIZZERIA</div>
            <div>Commercial Area, Satellite Town, Bahawalpur</div>
            <div>Phone: 0308-6547672</div>
            <div className="font-bold text-base mt-1">ORDER #{printingOrder.orderNo}</div>
            <div>{new Date(printingOrder.createdAt).toLocaleString()}</div>
            <div>Channel: {printingOrder.channel} | Type: {printingOrder.type}</div>
          </div>

          <div className="py-2 border-b border-black">
            <div>Customer: {printingOrder.customerName}</div>
            <div>Phone: {printingOrder.customerPhone}</div>
            {printingOrder.address && <div>Address: {printingOrder.address}</div>}
          </div>

          <div className="py-2 border-b border-black space-y-2">
            {printingOrder.items.map((it, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>
                    {it.quantity}x {it.name} {it.variantName && it.variantName !== "Regular" && it.variantName !== "Standard" ? `(${it.variantName})` : ""}
                  </span>
                  <span>{formatRupees(it.lineTotal)}</span>
                </div>
                {it.dealComponents && it.dealComponents.length > 0 && (
                  <div className="pl-3 text-[10px] text-stone-700">
                    <span className="font-bold uppercase text-[9px]">Includes:</span>
                    {it.dealComponents.map((c, ci) => (
                      <div key={ci}>  - {c}</div>
                    ))}
                  </div>
                )}
                {!it.dealComponents && it.note && (
                  <div className="pl-3 text-[10px] text-stone-700 italic">
                    {it.note}
                  </div>
                )}
                {it.modifiers && it.modifiers.length > 0 && (
                  <div className="pl-3 text-[10px] text-stone-600">
                    {it.modifiers.map((m) => `${m.group}: ${m.option}`).join(" | ")}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 font-bold text-right space-y-0.5">
            <div>Subtotal: {formatRupees(printingOrder.subtotal)}</div>
            {printingOrder.deliveryFee > 0 && <div>Delivery: {formatRupees(printingOrder.deliveryFee)}</div>}
            <div className="text-sm">TOTAL: {formatRupees(printingOrder.total)}</div>
            <div>Payment: {printingOrder.paymentMethod}</div>
          </div>

          <div className="text-center pt-4 text-[10px]">
            Thank you for choosing Rimjhim Pizzeria!
          </div>
        </div>
      )}
    </div>
  );
}
