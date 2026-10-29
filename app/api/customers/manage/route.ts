import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const { action, phone, notes } = await request.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone required" }, { status: 400 });
    }

    if (action === "toggleBlock") {
      const customer = mockDb.toggleBlockCustomer(phone);
      if (!customer) {
        return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, customer });
    }

    if (action === "updateNotes") {
      const customer = mockDb.updateCustomerNotes(phone, notes || "");
      if (!customer) {
        return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, customer });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to manage customer" }, { status: 500 });
  }
}

