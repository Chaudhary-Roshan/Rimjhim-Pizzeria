import { NextRequest, NextResponse } from "next/server";
import {
  authenticateByPin,
  authenticateByPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin, phone, password } = body;

    let session = null;

    if (pin) {
      session = authenticateByPin(pin);
    } else if (phone && password) {
      session = authenticateByPassword(phone, password);
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid PIN or credentials" },
        { status: 401 }
      );
    }

    const token = createSessionToken(session);

    const response = NextResponse.json({
      success: true,
      user: session,
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

