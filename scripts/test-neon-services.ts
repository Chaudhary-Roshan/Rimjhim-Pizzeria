import { prisma } from "../lib/prisma";
import { getNeonAuthJwks } from "../lib/neon-auth";
import { invokeNeonHelloFunction } from "../lib/neon-functions";
import { uploadToNeonStorage, listNeonStorageObjects } from "../lib/neon-storage";

async function main() {
  console.log("==========================================");
  console.log("TESTING ALL WIRED NEON SERVICES END-TO-END");
  console.log("==========================================\n");

  let allPassed = true;

  // 1. Neon PostgreSQL Database
  console.log("1. Testing Neon PostgreSQL Database...");
  try {
    const startTime = Date.now();
    const [categories, items, staff, zones, settings] = await Promise.all([
      prisma.category.count(),
      prisma.menuItem.count(),
      prisma.staffUser.count(),
      prisma.deliveryZone.count(),
      prisma.setting.count(),
    ]);
    const duration = Date.now() - startTime;
    console.log(`   [PASS] Neon PostgreSQL connected in ${duration}ms.`);
    console.log(`          - Categories: ${categories}`);
    console.log(`          - Menu Items: ${items}`);
    console.log(`          - Staff Accounts: ${staff}`);
    console.log(`          - Delivery Zones: ${zones}`);
    console.log(`          - Settings: ${settings}`);
  } catch (err: any) {
    allPassed = false;
    console.error("   [FAIL] Neon PostgreSQL failed:", err.message);
  }

  // 2. Neon Functions
  console.log("\n2. Testing Neon Functions (hello.ts)...");
  try {
    const res = await invokeNeonHelloFunction();
    if (res.success && res.output === "Hello from Neon Functions") {
      console.log(`   [PASS] Neon Function invoked successfully (HTTP ${res.status}).`);
      console.log(`          Response output: "${res.output}"`);
    } else {
      allPassed = false;
      console.error(`   [FAIL] Neon Function returned unexpected response:`, res);
    }
  } catch (err: any) {
    allPassed = false;
    console.error("   [FAIL] Neon Function failed:", err.message);
  }

  // 3. Neon Auth
  console.log("\n3. Testing Neon Auth (JWKS Endpoint)...");
  try {
    const jwks = await getNeonAuthJwks();
    if (jwks.keys && jwks.keys.length > 0) {
      console.log(`   [PASS] Neon Auth JWKS retrieved successfully.`);
      console.log(`          Keys found: ${jwks.keys.length}`);
      console.log(`          Algorithm: ${jwks.keys[0].alg}, Type: ${jwks.keys[0].kty}`);
    } else {
      allPassed = false;
      console.error("   [FAIL] No keys found in JWKS response.");
    }
  } catch (err: any) {
    allPassed = false;
    console.error("   [FAIL] Neon Auth failed:", err.message);
  }

  // 4. Neon Object Storage
  console.log("\n4. Testing Neon Object Storage (Bucket: assets)...");
  try {
    const testKey = `test/order-receipt-${Date.now()}.txt`;
    const content = "Rimjhim Pizzeria sample asset content generated at " + new Date().toISOString();
    await uploadToNeonStorage("assets", testKey, content, "text/plain");
    console.log(`   [PASS] Uploaded object "${testKey}" to bucket "assets".`);

    const objects = await listNeonStorageObjects("assets");
    console.log(`   [PASS] Listed objects in bucket "assets": ${objects.length} item(s) found.`);
    for (const obj of objects.slice(0, 3)) {
      console.log(`          - ${obj.Key} (${obj.Size} bytes)`);
    }
  } catch (err: any) {
    allPassed = false;
    console.error("   [FAIL] Neon Object Storage failed:", err.message);
  }

  console.log("\n==========================================");
  if (allPassed) {
    console.log("ALL 4 NEON SERVICES PASSED VERIFICATION!");
  } else {
    console.log("SOME SERVICES FAILED VERIFICATION.");
  }
  console.log("==========================================");

  await prisma.$disconnect();
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

