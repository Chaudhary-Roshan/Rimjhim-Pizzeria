import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNeonAuthJwks } from "@/lib/neon-auth";
import { invokeNeonHelloFunction } from "@/lib/neon-functions";
import { uploadToNeonStorage, listNeonStorageObjects } from "@/lib/neon-storage";

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    services: {},
  };

  // 1. Test Neon Postgres Database
  try {
    const [categoriesCount, itemsCount, staffCount, zonesCount] = await Promise.all([
      prisma.category.count(),
      prisma.menuItem.count(),
      prisma.staffUser.count(),
      prisma.deliveryZone.count(),
    ]);

    results.services.postgres = {
      status: "HEALTHY",
      provider: "Neon PostgreSQL",
      dataCounts: {
        categories: categoriesCount,
        menuItems: itemsCount,
        staffUsers: staffCount,
        deliveryZones: zonesCount,
      },
    };
  } catch (err: any) {
    results.services.postgres = {
      status: "FAILED",
      error: err.message,
    };
  }

  // 2. Test Neon Functions
  try {
    const fnResponse = await invokeNeonHelloFunction();
    results.services.functions = {
      status: fnResponse.success ? "HEALTHY" : "FAILED",
      statusCode: fnResponse.status,
      output: fnResponse.output,
    };
  } catch (err: any) {
    results.services.functions = {
      status: "FAILED",
      error: err.message,
    };
  }

  // 3. Test Neon Auth (JWKS)
  try {
    const jwks = await getNeonAuthJwks();
    results.services.auth = {
      status: "HEALTHY",
      keysCount: jwks.keys?.length || 0,
      firstKeyAlg: jwks.keys?.[0]?.alg,
      firstKeyType: jwks.keys?.[0]?.kty,
    };
  } catch (err: any) {
    results.services.auth = {
      status: "FAILED",
      error: err.message,
    };
  }

  // 4. Test Neon Object Storage (S3 Bucket "assets")
  try {
    const testKey = `health/test-${Date.now()}.json`;
    await uploadToNeonStorage(
      "assets",
      testKey,
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      "application/json"
    );

    const objects = await listNeonStorageObjects("assets");
    results.services.objectStorage = {
      status: "HEALTHY",
      bucket: "assets",
      uploadedKey: testKey,
      objectsInBucket: objects.length,
    };
  } catch (err: any) {
    results.services.objectStorage = {
      status: "FAILED",
      error: err.message,
    };
  }

  const allHealthy = Object.values(results.services).every(
    (s: any) => s.status === "HEALTHY"
  );

  return NextResponse.json(
    {
      success: allHealthy,
      ...results,
    },
    { status: allHealthy ? 200 : 500 }
  );
}

