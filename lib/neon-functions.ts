/**
 * Neon Functions Integration
 * Calls functions deployed on Neon Functions compute
 */

export async function invokeNeonHelloFunction(): Promise<{
  success: boolean;
  status: number;
  output: string;
}> {
  const baseUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEON_FUNCTION_HELLO_BASE_URL is not configured.");
  }

  const cleanUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const res = await fetch(cleanUrl, {
    method: "GET",
    cache: "no-store",
  });

  const text = await res.text();
  return {
    success: res.ok,
    status: res.status,
    output: text.trim(),
  };
}
