/**
 * Format numbers as whole Pakistani Rupees (e.g. "Rs 1,100")
 */
export function formatRupees(amount: number): string {
  const formatted = new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs ${formatted}`;
}

/**
 * Format Pakistani phone numbers to display format (03XX-XXXXXXX)
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length === 12) {
    const local = "0" + digits.substring(2);
    return `${local.substring(0, 4)}-${local.substring(4)}`;
  }
  if (digits.length === 11 && digits.startsWith("03")) {
    return `${digits.substring(0, 4)}-${digits.substring(4)}`;
  }
  return phone;
}

/**
 * Normalize phone to E.164 without plus: 923001234567
 */
export function normalizePhone(input: string): string {
  let cleaned = input.replace(/\D/g, "");
  if (cleaned.startsWith("03") && cleaned.length === 11) {
    cleaned = "92" + cleaned.substring(1);
  } else if (cleaned.startsWith("3") && cleaned.length === 10) {
    cleaned = "92" + cleaned;
  }
  return cleaned;
}

/**
 * Validates Pakistani mobile phone (0300-1234567 or 923001234567)
 */
export function isValidPakistaniPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^923\d{9}$/.test(normalized);
}
