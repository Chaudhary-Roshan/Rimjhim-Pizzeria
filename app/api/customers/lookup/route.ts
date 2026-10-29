import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ success: false, message: "Phone required" }, { status: 400 });
  }

  const customer = mockDb.getCustomerByPhone(phone);
  return NextResponse.json({ success: true, customer });
}
