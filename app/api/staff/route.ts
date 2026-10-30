import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/mock-db";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session || (session.role !== "ADMIN" && session.role !== "OWNER")) {
    return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
  }

  const staff = mockDb.getStaffUsers();
  return NextResponse.json({ success: true, staff });
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session || (session.role !== "ADMIN" && session.role !== "OWNER")) {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, pin, name, phone, role, password } = body;

    if (action === "updatePin") {
      if (!id || !pin || pin.length < 4) {
        return NextResponse.json({ success: false, message: "Valid 4-digit PIN required" }, { status: 400 });
      }
      const updated = mockDb.updateStaffPin(id, pin);
      return NextResponse.json({ success: true, staff: updated });
    }

    if (action === "toggleStatus") {
      if (!id) return NextResponse.json({ success: false, message: "Staff ID required" }, { status: 400 });
      const updated = mockDb.toggleStaffStatus(id);
      return NextResponse.json({ success: true, staff: updated });
    }

    if (action === "delete") {
      if (!id) return NextResponse.json({ success: false, message: "Staff ID required" }, { status: 400 });
      mockDb.deleteStaffUser(id);
      return NextResponse.json({ success: true });
    }

    if (action === "create") {
      if (!name || !phone || !pin) {
        return NextResponse.json({ success: false, message: "Name, phone, and 4-digit PIN are required" }, { status: 400 });
      }
      const created = mockDb.createStaffUser({
        name: name.trim(),
        phone: phone.trim(),
        role: role || "CASHIER",
        pin: pin.trim(),
        password: password?.trim() || "staff123",
        isActive: true,
      });
      return NextResponse.json({ success: true, staff: created });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: "Staff operation failed" }, { status: 500 });
  }
}

