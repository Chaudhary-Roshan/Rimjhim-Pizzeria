import { mockDb } from "./mock-db";

// Staff Authentication & Session Helpers
export interface StaffSession {
  id: string;
  name: string;
  role: "ADMIN" | "OWNER" | "CASHIER" | "KITCHEN";
  phone: string;
}

export const STAFF_ACCOUNTS: (StaffSession & { pin: string; password?: string; isActive?: boolean })[] = [
  {
    id: "staff-1",
    name: process.env.ADMIN_NAME || "Hamza Afzal",
    phone: process.env.ADMIN_PHONE || "03001234567",
    role: "ADMIN",
    pin: process.env.OWNER_POS_PIN || "1234",
    password: process.env.ADMIN_PASSWORD || "admin123",
    isActive: true,
  },
];

export const AUTH_COOKIE_NAME = "rimjhim_staff_session";

const SECRET_KEY = process.env.AUTH_SECRET || "rimjhim_pizzeria_super_secret_jwt_key_2026";

export function authenticateByPin(pin: string): StaffSession | null {
  const cleanPin = pin.trim();
  const allStaff = typeof mockDb !== "undefined" && mockDb.getStaffUsers ? mockDb.getStaffUsers() : STAFF_ACCOUNTS;
  const staff = allStaff.find((s) => s.pin === cleanPin && s.isActive !== false);
  if (!staff) return null;
  return {
    id: staff.id,
    name: staff.name,
    phone: staff.phone,
    role: staff.role as "ADMIN" | "OWNER" | "CASHIER",
  };
}

export function authenticateByPassword(phone: string, password: string): StaffSession | null {
  const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
  const allStaff = typeof mockDb !== "undefined" && mockDb.getStaffUsers ? mockDb.getStaffUsers() : STAFF_ACCOUNTS;
  const staff = allStaff.find(
    (s) => s.phone.replace(/[^0-9]/g, "") === cleanPhone && s.password === password.trim() && s.isActive !== false
  );
  if (!staff) return null;
  return {
    id: staff.id,
    name: staff.name,
    phone: staff.phone,
    role: staff.role as "ADMIN" | "OWNER" | "CASHIER",
  };
}

function safeEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf-8").toString("base64url");
  }
  return btoa(encodeURIComponent(str))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function safeDecode(base64: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64url").toString("utf-8");
  }
  const normalized = base64.replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(atob(normalized));
}

// Encode session as base64 with signature
export function createSessionToken(session: StaffSession): string {
  const payload = {
    ...session,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const json = JSON.stringify(payload);
  const base64 = safeEncode(json);

  // Create signature
  let hash = 0;
  for (let i = 0; i < base64.length; i++) {
    hash = (hash << 5) - hash + base64.charCodeAt(i) + SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    hash |= 0;
  }
  const sig = Math.abs(hash).toString(36);
  return `${base64}.${sig}`;
}

export function verifySessionToken(token: string): StaffSession | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [base64, sig] = token.split(".");

    // Check signature
    let hash = 0;
    for (let i = 0; i < base64.length; i++) {
      hash = (hash << 5) - hash + base64.charCodeAt(i) + SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      hash |= 0;
    }
    const expectedSig = Math.abs(hash).toString(36);
    if (sig !== expectedSig) return null;

    const json = safeDecode(base64);
    const payload = JSON.parse(json);

    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return {
      id: payload.id,
      name: payload.name,
      role: payload.role,
      phone: payload.phone,
    };
  } catch {
    return null;
  }
}
