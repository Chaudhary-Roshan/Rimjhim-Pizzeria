/**
 * Generates business date and sequential order numbers: RP-YYMMDD-NNN
 * Accounting for store cut-off time (e.g. 4:00 AM Pakistan Standard Time)
 */

export function getBusinessDate(cutoffHour: number = 4): string {
  // Current time in Asia/Karachi (UTC+5)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const pkTime = new Date(utc + 3600000 * 5);

  // If current PK hour is before cutoffHour (e.g. 1 AM is before 4 AM),
  // it belongs to previous calendar day
  if (pkTime.getHours() < cutoffHour) {
    pkTime.setDate(pkTime.getDate() - 1);
  }

  const yy = String(pkTime.getFullYear()).slice(-2);
  const mm = String(pkTime.getMonth() + 1).padStart(2, "0");
  const dd = String(pkTime.getDate()).padStart(2, "0");

  return `${yy}${mm}${dd}`;
}

let inMemoryDailyCounter: Record<string, number> = {};

export function generateOrderNumber(cutoffHour: number = 4): { orderNo: string; dailyNumber: number; shortTicket: string } {
  const businessDay = getBusinessDate(cutoffHour);
  const count = (inMemoryDailyCounter[businessDay] || 0) + 1;
  inMemoryDailyCounter[businessDay] = count;

  const paddedNum = String(count).padStart(3, "0");
  const orderNo = `RP-${businessDay}-${paddedNum}`;
  const shortTicket = `#${paddedNum}`;

  return { orderNo, dailyNumber: count, shortTicket };
}
