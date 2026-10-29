import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockDb } from "@/lib/mock-db";
import { buildWhatsAppOrderUrl } from "@/lib/whatsapp";

const OrderItemSchema = z.object({
  menuItemId: z.string(),
  name: z.string(),
  variantName: z.string().optional(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().positive(),
  modifiers: z
    .array(
      z.object({
        group: z.string(),
        option: z.string(),
        priceDelta: z.number(),
      })
    )
    .default([]),
  note: z.string().optional(),
});

const CreateOrderSchema = z.object({
  channel: z.enum(["ONLINE", "POS"]).default("ONLINE"),
  type: z.enum(["DELIVERY", "TAKEAWAY", "DINE_IN"]),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  address: z.string().optional(),
  landmark: z.string().optional(),
  tableLabel: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, "Cart cannot be empty"),
  deliveryFee: z.number().default(0),
  discount: z.number().default(0),
  discountReason: z.string().optional(),
  paymentMethod: z.enum(["CASH", "CARD", "JAZZCASH", "EASYPAISA"]).default("CASH"),
  customerNote: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");
  const phone = searchParams.get("phone");

  let orders = mockDb.getOrders();
  if (status) {
    orders = orders.filter((o) => o.status === status);
  }
  if (channel) {
    orders = orders.filter((o) => o.channel === channel);
  }
  if (phone) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    orders = orders.filter((o) => o.customerPhone.replace(/[^0-9]/g, "") === cleanPhone);
  }

  return NextResponse.json({ success: true, count: orders.length, orders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateOrderSchema.parse(body);

    // Compute line totals and server subtotal
    const processedItems = validated.items.map((item, idx) => {
      const lineTotal = item.unitPrice * item.quantity;
      return {
        id: `item-${Date.now()}-${idx}`,
        name: item.name,
        variantName: item.variantName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal,
        modifiers: item.modifiers,
        note: item.note,
      };
    });

    const subtotal = processedItems.reduce((acc, it) => acc + it.lineTotal, 0);
    const deliveryFee = validated.type === "DELIVERY" ? validated.deliveryFee : 0;
    const total = Math.max(0, subtotal + deliveryFee - validated.discount);

    // Create order record
    const createdOrder = mockDb.createOrder({
      channel: validated.channel,
      type: validated.type,
      customerName: validated.customerName,
      customerPhone: validated.customerPhone,
      address: validated.address,
      landmark: validated.landmark,
      tableLabel: validated.tableLabel,
      subtotal,
      deliveryFee,
      discount: validated.discount,
      discountReason: validated.discountReason,
      tax: 0,
      total,
      paymentStatus: validated.channel === "POS" ? "PAID" : "UNPAID",
      paymentMethod: validated.paymentMethod,
      customerNote: validated.customerNote,
      items: processedItems,
    });

    // Build the WhatsApp URL
    const whatsappUrl = buildWhatsAppOrderUrl(
      {
        orderNo: createdOrder.orderNo,
        type: createdOrder.type,
        paymentMethod:
          createdOrder.paymentMethod === "CASH"
            ? createdOrder.type === "DELIVERY"
              ? "Cash on delivery"
              : "Cash at pickup"
            : createdOrder.paymentMethod,
        customerName: createdOrder.customerName,
        customerPhone: createdOrder.customerPhone,
        address: createdOrder.address,
        landmark: createdOrder.landmark,
        items: createdOrder.items.map((i) => ({
          name: i.name,
          variantName: i.variantName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          lineTotal: i.lineTotal,
          modifiersSummary: i.modifiers.map((m) => m.option).join(", "),
        })),
        subtotal: createdOrder.subtotal,
        deliveryFee: createdOrder.deliveryFee,
        discount: createdOrder.discount,
        total: createdOrder.total,
        customerNote: createdOrder.customerNote,
      },
      "923086547672",
      request.nextUrl.origin
    );

    return NextResponse.json({
      success: true,
      order: createdOrder,
      whatsappUrl,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
