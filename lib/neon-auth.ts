/**
 * Neon Auth Integration
 * Uses NEON_AUTH_BASE_URL and NEON_AUTH_JWKS_URL
 */

export interface NeonJwksResponse {
  keys: Array<{
    kty: string;
    alg: string;
    crv?: string;
    x?: string;
    kid?: string;
    use?: string;
  }>;
}

export async function getNeonAuthJwks(): Promise<NeonJwksResponse> {
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL;
  if (!jwksUrl) {
    throw new Error("NEON_AUTH_JWKS_URL is not configured in environment variables.");
  }

  const response = await fetch(jwksUrl, {
    method: "GET",
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Neon Auth JWKS: HTTP ${response.status}`);
  }

  return response.json();
}

export function getNeonAuthConfig() {
  return {
    baseUrl: process.env.NEON_AUTH_BASE_URL || null,
    jwksUrl: process.env.NEON_AUTH_JWKS_URL || null,
    isConfigured: Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_JWKS_URL),
  };
}

