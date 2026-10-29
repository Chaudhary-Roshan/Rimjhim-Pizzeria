import { formatRupees, formatPhone } from "./format";

export interface WhatsAppOrderPayload {
  orderNo: string;
  type: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  address?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  items: {
    name: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    modifiersSummary?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  customerNote?: string;
}

/**
 * Builds the WhatsApp Click-to-Chat URL
 * Target number: 923086547672 (Rimjhim Pizzeria primary WhatsApp)
 */
export function buildWhatsAppOrderUrl(
  order: WhatsAppOrderPayload,
  restaurantPhone: string = "923086547672",
  appBaseUrl: string = "https://rimjhimpizzeria.com"
): string {
  const typeLabel =
    order.type === "DELIVERY"
      ? "Delivery"
      : order.type === "TAKEAWAY"
      ? "Takeaway / Pickup"
      : "Dine-In";

  const lines: string[] = [];
  lines.push(`*NEW ORDER #${order.orderNo}*`);
  lines.push(`${typeLabel} | ${order.paymentMethod}`);
  lines.push(`${order.customerName} | ${formatPhone(order.customerPhone)}`);

  if (order.type === "DELIVERY" && order.address) {
    lines.push(order.address);
    if (order.landmark) {
      lines.push(`Landmark: ${order.landmark}`);
    }
    if (order.lat && order.lng) {
      lines.push(`Map: https://maps.google.com/?q=${order.lat},${order.lng}`);
    }
  }

  lines.push(""); // blank line before items

  // Format line items
  for (const item of order.items) {
    const variantSuffix = item.variantName && item.variantName !== "Regular" && item.variantName !== "Standard"
      ? ` (${item.variantName})`
      : "";
    const modSuffix = item.modifiersSummary ? ` [${item.modifiersSummary}]` : "";
    const nameLine = `${item.quantity} x ${item.name}${variantSuffix}${modSuffix}`;
    const priceLine = formatRupees(item.lineTotal);
    lines.push(`${nameLine} .... ${priceLine}`);
  }

  lines.push(""); // blank line before totals
  lines.push(`Subtotal: ${formatRupees(order.subtotal)}`);

  if (order.deliveryFee > 0) {
    lines.push(`Delivery: ${formatRupees(order.deliveryFee)}`);
  }
  if (order.discount && order.discount > 0) {
    lines.push(`Discount: -${formatRupees(order.discount)}`);
  }

  lines.push(`*TOTAL: ${formatRupees(order.total)}*`);

  if (order.customerNote && order.customerNote.trim().length > 0) {
    lines.push("");
    lines.push(`Note: ${order.customerNote.trim()}`);
  }

  lines.push("");
  lines.push(`Track live status: ${appBaseUrl}/track/${order.orderNo}`);

  const messageText = lines.join("\n");
  const encodedText = encodeURIComponent(messageText);
  return `https://wa.me/${restaurantPhone}?text=${encodedText}`;
}
