import { PrismaClient } from "@prisma/client";
import {
  CATEGORIES_DATA,
  MODIFIER_GROUPS_DATA,
  DELIVERY_ZONES_DATA,
  MENU_ITEMS_DATA,
  STORE_SETTINGS,
} from "../lib/initial-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Rimjhim Pizzeria Database...");

  // 1. Store Settings
  await prisma.setting.upsert({
    where: { key: "store.info" },
    update: { value: STORE_SETTINGS },
    create: {
      key: "store.info",
      value: STORE_SETTINGS,
    },
  });
  console.log("✓ Settings seeded");

  // 2. Default Staff accounts
  await prisma.staffUser.upsert({
    where: { phone: "03001234567" },
    update: {},
    create: {
      name: "Hamza Afzal",
      phone: "03001234567",
      email: "admin@rimjhimpizzeria.com",
      passwordHash: "demo_hash_argon2",
      posPinHash: "1234",
      role: "ADMIN",
    },
  });

  await prisma.staffUser.upsert({
    where: { phone: "03086547672" },
    update: {},
    create: {
      name: "Owner / Counter",
      phone: "03086547672",
      email: "owner@rimjhimpizzeria.com",
      passwordHash: "demo_hash_argon2",
      posPinHash: "9999",
      role: "OWNER",
    },
  });
  console.log("✓ Staff accounts seeded");

  // 3. Delivery Zones
  for (const [index, zone] of DELIVERY_ZONES_DATA.entries()) {
    await prisma.deliveryZone.create({
      data: {
        name: zone.name,
        fee: zone.fee,
        minOrder: zone.minOrder,
        etaMinutes: zone.etaMinutes,
        sortOrder: index + 1,
      },
    });
  }
  console.log(`✓ ${DELIVERY_ZONES_DATA.length} delivery zones seeded`);

  // 4. Modifier Groups
  const modGroupMap = new Map<string, bigint>();
  for (const group of MODIFIER_GROUPS_DATA) {
    const createdGroup = await prisma.modifierGroup.create({
      data: {
        name: group.name,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        options: {
          create: group.options.map((opt, i) => ({
            name: opt.name,
            priceDelta: opt.priceDelta,
            sortOrder: i + 1,
          })),
        },
      },
    });
    modGroupMap.set(group.name, createdGroup.id);
  }
  console.log(`✓ ${MODIFIER_GROUPS_DATA.length} modifier groups seeded`);

  // 5. Categories
  const categoryMap = new Map<string, bigint>();
  for (const cat of CATEGORIES_DATA) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
      },
    });
    categoryMap.set(cat.slug, createdCat.id);
  }
  console.log(`✓ ${CATEGORIES_DATA.length} categories seeded`);

  // 6. Menu Items & Variants
  for (const [index, item] of MENU_ITEMS_DATA.entries()) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const createdItem = await prisma.menuItem.create({
      data: {
        categoryId,
        kind: item.kind,
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.imageUrl,
        tags: item.tags,
        isDealOfDay: item.isDealOfDay ?? false,
        sortOrder: index + 1,
        variants: {
          create: item.variants.map((v, vIndex) => ({
            name: v.name,
            price: v.price,
            sortOrder: vIndex + 1,
          })),
        },
        dealComponents: item.dealComponents
          ? {
              create: item.dealComponents.map((c, cIndex) => ({
                label: c.label,
                quantity: c.quantity,
                sortOrder: cIndex + 1,
              })),
            }
          : undefined,
      },
    });

    // Link modifier groups
    if (item.modifierGroupNames) {
      for (const groupName of item.modifierGroupNames) {
        const groupId = modGroupMap.get(groupName);
        if (groupId) {
          await prisma.itemModifierGroup.create({
            data: {
              menuItemId: createdItem.id,
              groupId: groupId,
            },
          });
        }
      }
    }
  }
  console.log(`✓ ${MENU_ITEMS_DATA.length} menu items & deals seeded`);
  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
