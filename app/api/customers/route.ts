import { NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";

export async function GET() {
  const customers = mockDb.getCustomers();
  return NextResponse.json({ success: true, customers });
}
