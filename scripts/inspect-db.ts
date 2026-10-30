import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspect() {
  const staff = await prisma.staffUser.findMany({
    select: { id: true, name: true, phone: true, email: true, role: true, isActive: true },
  });
  const ordersCount = await prisma.order.count();
  const orderItemsCount = await prisma.orderItem.count();
  const orderLogsCount = await prisma.orderStatusLog.count();
  const paymentsCount = await prisma.payment.count();
  const shiftsCount = await prisma.shift.count();
  const customersCount = await prisma.customer.count();
  const addressesCount = await prisma.customerAddress.count();
  const auditLogsCount = await prisma.auditLog.count();
  const whatsappCount = await prisma.whatsAppMessage.count();
  const dailyCountersCount = await prisma.dailyCounter.count();
  const categoriesCount = await prisma.category.count();
  const menuItemsCount = await prisma.menuItem.count();
  const variantsCount = await prisma.itemVariant.count();
  const zonesCount = await prisma.deliveryZone.count();
  const settingsCount = await prisma.setting.count();

  console.log("=== CURRENT DATABASE STATE ===");
  console.log(JSON.stringify({
    staff,
    ordersCount,
    orderItemsCount,
    orderLogsCount,
    paymentsCount,
    shiftsCount,
    customersCount,
    addressesCount,
    auditLogsCount,
    whatsappCount,
    dailyCountersCount,
    categoriesCount,
    menuItemsCount,
    variantsCount,
    zonesCount,
    settingsCount,
  }, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

inspect()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

