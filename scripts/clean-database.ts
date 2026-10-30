import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clean() {
  console.log("Cleaning Neon Database for production...");

  // 1. Delete all transactional / temporary data if any exist
  await prisma.orderStatusLog.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.whatsAppMessage.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.shift.deleteMany({});
  await prisma.dailyCounter.deleteMany({});
  await prisma.customerAddress.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.auditLog.deleteMany({});

  // 2. Remove all non-admin staff accounts
  const deletedStaff = await prisma.staffUser.deleteMany({
    where: {
      role: { not: "ADMIN" },
    },
  });
  console.log(`Removed ${deletedStaff.count} non-admin staff account(s).`);

  // 3. Ensure primary Admin exists and is active
  const admin = await prisma.staffUser.upsert({
    where: { phone: "03001234567" },
    update: {
      role: "ADMIN",
      isActive: true,
      posPinHash: "1234",
    },
    create: {
      name: "Hamza Afzal",
      phone: "03001234567",
      email: "admin@rimjhimpizzeria.com",
      passwordHash: "demo_hash_argon2",
      posPinHash: "1234",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`Admin account confirmed: ID ${admin.id}, Phone ${admin.phone}, Role ${admin.role}`);

  // 4. Verify counts
  const staff = await prisma.staffUser.findMany({ select: { id: true, name: true, phone: true, role: true } });
  const categoriesCount = await prisma.category.count();
  const menuItemsCount = await prisma.menuItem.count();
  const variantsCount = await prisma.itemVariant.count();
  const zonesCount = await prisma.deliveryZone.count();
  const ordersCount = await prisma.order.count();
  const customersCount = await prisma.customer.count();

  console.log("\n=== POST-CLEANUP STATUS ===");
  console.log({
    categoriesCount,
    menuItemsCount,
    variantsCount,
    zonesCount,
    ordersCount,
    customersCount,
    staffCount: staff.length,
    staff: staff.map(s => ({ ...s, id: s.id.toString() })),
  });
}

clean()
  .catch((err) => {
    console.error("Clean error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

