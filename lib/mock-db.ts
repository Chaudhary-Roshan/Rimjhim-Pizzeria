import {
  CATEGORIES_DATA,
  MENU_ITEMS_DATA,
  MODIFIER_GROUPS_DATA,
  DELIVERY_ZONES_DATA,
  STORE_SETTINGS,
  MenuItemSeed,
  DeliveryZoneSeed,
} from "./initial-data";
import { generateOrderNumber } from "./order-number";

export interface OrderRecord {
  id: string;
  orderNo: string;
  businessDay: string;
  channel: "ONLINE" | "POS";
  type: "DELIVERY" | "TAKEAWAY" | "DINE_IN";
  status: "NEW" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "COMPLETED" | "CANCELLED";
  customerName: string;
  customerPhone: string;
  address?: string;
  landmark?: string;
  tableLabel?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountReason?: string;
  tax: number;
  total: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  paymentMethod: "CASH" | "CARD" | "JAZZCASH" | "EASYPAISA";
  customerNote?: string;
  etaMinutes?: number;
  cancelReason?: string;
  createdAt: string;
  items: {
    id: string;
    name: string;
    variantName?: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    modifiers: { group: string; option: string; priceDelta: number }[];
    note?: string;
  }[];
  isFirstOrder?: boolean;
}

export interface CustomerRecord {
  phone: string;
  name: string;
  ordersCount: number;
  totalSpent: number;
  firstOrderAt: string;
  lastOrderAt: string;
  lastAddress?: string;
  isBlocked: boolean;
  notes?: string;
}

export interface StaffRecord {
  id: string;
  name: string;
  phone: string;
  role: "ADMIN" | "OWNER" | "CASHIER" | "KITCHEN";
  pin: string;
  password?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShiftRecord {
  id: string;
  openedBy: string;
  openedAt: string;
  openingCash: number;
  closedBy?: string;
  closedAt?: string;
  countedCash?: number;
  expectedCash?: number;
  status: "OPEN" | "CLOSED";
}

// Global in-memory storage (persists across hot reloads in Next.js development)
const globalStore = global as unknown as {
  __RIMJHIM_ORDERS?: OrderRecord[];
  __RIMJHIM_CUSTOMERS?: Map<string, CustomerRecord>;
  __RIMJHIM_CURRENT_SHIFT?: ShiftRecord;
  __RIMJHIM_SETTINGS?: typeof STORE_SETTINGS;
  __RIMJHIM_ITEMS?: MenuItemSeed[];
  __RIMJHIM_ZONES?: DeliveryZoneSeed[];
  __RIMJHIM_STAFF?: StaffRecord[];
  __RIMJHIM_SSE_CLIENTS?: Set<(data: string) => void>;
};

if (!globalStore.__RIMJHIM_STAFF) {
  globalStore.__RIMJHIM_STAFF = [
    {
      id: "staff-1",
      name: "Hamza Afzal",
      phone: "03001234567",
      role: "ADMIN",
      pin: process.env.OWNER_POS_PIN || "1234",
      password: "admin123",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "staff-2",
      name: "Owner / Counter",
      phone: "03086547672",
      role: "OWNER",
      pin: "9999",
      password: "owner123",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "staff-3",
      name: "Counter Cashier",
      phone: "03000000001",
      role: "CASHIER",
      pin: "0000",
      password: "cashier123",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "staff-4",
      name: "Main Kitchen Display",
      phone: "03000000002",
      role: "KITCHEN",
      pin: "1111",
      password: "kitchen123",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ];
}

if (!globalStore.__RIMJHIM_ORDERS) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  globalStore.__RIMJHIM_ORDERS = [
    {
      id: "ord-seed-1",
      orderNo: "RP-261029-001",
      businessDay: today,
      channel: "ONLINE",
      type: "DELIVERY",
      status: "NEW",
      customerName: "Usman Tariq",
      customerPhone: "03011234567",
      address: "House 14-B, Street 3, Model Town A, Bahawalpur",
      landmark: "Near City Park",
      subtotal: 1850,
      deliveryFee: 150,
      discount: 0,
      tax: 0,
      total: 2000,
      paymentStatus: "UNPAID",
      paymentMethod: "CASH",
      customerNote: "Please send extra garlic sauce and oregano packets.",
      etaMinutes: 40,
      createdAt: new Date(now.getTime() - 8 * 60000).toISOString(),
      items: [
        {
          id: "seed-i1",
          name: "Rimjhim Special Pizza",
          variantName: "Large",
          unitPrice: 1550,
          quantity: 1,
          lineTotal: 1550,
          modifiers: [{ group: "Crust Type", option: "Cheese Stuffed Crust", priceDelta: 200 }],
        },
        {
          id: "seed-i2",
          name: "Coca Cola",
          variantName: "1.5 Litre",
          unitPrice: 250,
          quantity: 1,
          lineTotal: 250,
          modifiers: [],
        },
      ],
      isFirstOrder: false,
    },
    {
      id: "ord-seed-2",
      orderNo: "RP-261029-002",
      businessDay: today,
      channel: "POS",
      type: "DINE_IN",
      status: "PREPARING",
      customerName: "Ayesha Khan",
      customerPhone: "03029876543",
      tableLabel: "Table #4",
      subtotal: 1390,
      deliveryFee: 0,
      discount: 0,
      tax: 0,
      total: 1390,
      paymentStatus: "PAID",
      paymentMethod: "CARD",
      customerNote: "Less spicy for kids please",
      etaMinutes: 20,
      createdAt: new Date(now.getTime() - 22 * 60000).toISOString(),
      items: [
        {
          id: "seed-i3",
          name: "Chicken Tikka Pizza",
          variantName: "Medium",
          unitPrice: 990,
          quantity: 1,
          lineTotal: 990,
          modifiers: [{ group: "Extra Toppings", option: "Extra Mozzarella Cheese", priceDelta: 150 }],
        },
        {
          id: "seed-i4",
          name: "Crispy Fried Wings",
          variantName: "6 Pieces",
          unitPrice: 400,
          quantity: 1,
          lineTotal: 400,
          modifiers: [],
        },
      ],
      isFirstOrder: true,
    },
    {
      id: "ord-seed-3",
      orderNo: "RP-261029-003",
      businessDay: today,
      channel: "ONLINE",
      type: "TAKEAWAY",
      status: "READY",
      customerName: "Bilal Ahmed",
      customerPhone: "03215551234",
      subtotal: 2150,
      deliveryFee: 0,
      discount: 100,
      discountReason: "Loyalty promo",
      tax: 0,
      total: 2050,
      paymentStatus: "UNPAID",
      paymentMethod: "CASH",
      etaMinutes: 5,
      createdAt: new Date(now.getTime() - 35 * 60000).toISOString(),
      items: [
        {
          id: "seed-i5",
          name: "Crown Crust Supreme Pizza",
          variantName: "Large",
          unitPrice: 1650,
          quantity: 1,
          lineTotal: 1650,
          modifiers: [],
        },
        {
          id: "seed-i6",
          name: "Zinger Burger",
          variantName: "Single",
          unitPrice: 400,
          quantity: 1,
          lineTotal: 400,
          modifiers: [{ group: "Extras", option: "Cheese Slice", priceDelta: 50 }],
        },
      ],
      isFirstOrder: false,
    },
    {
      id: "ord-seed-4",
      orderNo: "RP-261029-004",
      businessDay: today,
      channel: "ONLINE",
      type: "DELIVERY",
      status: "COMPLETED",
      customerName: "Fatima Noor",
      customerPhone: "03337778899",
      address: "House 89, Sector 2, Satellite Town, Bahawalpur",
      landmark: "Opposite Commercial Market",
      subtotal: 1600,
      deliveryFee: 80,
      discount: 0,
      tax: 0,
      total: 1680,
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      createdAt: new Date(now.getTime() - 75 * 60000).toISOString(),
      items: [
        {
          id: "seed-i7",
          name: "Fajita Sicilian Pizza",
          variantName: "Medium",
          unitPrice: 1050,
          quantity: 1,
          lineTotal: 1050,
          modifiers: [],
        },
        {
          id: "seed-i8",
          name: "Cheesy Garlic Bread",
          variantName: "Regular",
          unitPrice: 350,
          quantity: 1,
          lineTotal: 350,
          modifiers: [],
        },
        {
          id: "seed-i9",
          name: "Sprite",
          variantName: "500ml",
          unitPrice: 120,
          quantity: 1,
          lineTotal: 120,
          modifiers: [],
        },
      ],
      isFirstOrder: false,
    },
    {
      id: "ord-seed-5",
      orderNo: "RP-261029-005",
      businessDay: today,
      channel: "POS",
      type: "TAKEAWAY",
      status: "COMPLETED",
      customerName: "Counter Walk-in",
      customerPhone: "03001112233",
      subtotal: 850,
      deliveryFee: 0,
      discount: 0,
      tax: 0,
      total: 850,
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      createdAt: new Date(now.getTime() - 110 * 60000).toISOString(),
      items: [
        {
          id: "seed-i10",
          name: "Chicken Malai Boti Pizza",
          variantName: "Small",
          unitPrice: 550,
          quantity: 1,
          lineTotal: 550,
          modifiers: [],
        },
        {
          id: "seed-i11",
          name: "Mint Margarita",
          variantName: "Single",
          unitPrice: 300,
          quantity: 1,
          lineTotal: 300,
          modifiers: [],
        },
      ],
      isFirstOrder: false,
    },
  ];
}

if (!globalStore.__RIMJHIM_CUSTOMERS) {
  globalStore.__RIMJHIM_CUSTOMERS = new Map([
    [
      "03011234567",
      {
        phone: "03011234567",
        name: "Usman Tariq",
        ordersCount: 4,
        totalSpent: 8450,
        firstOrderAt: "2026-09-12T14:30:00.000Z",
        lastOrderAt: new Date().toISOString(),
        lastAddress: "House 14-B, Street 3, Model Town A, Bahawalpur",
        isBlocked: false,
        notes: "Prefers garlic sauce. Reliable VIP customer.",
      },
    ],
    [
      "03029876543",
      {
        phone: "03029876543",
        name: "Ayesha Khan",
        ordersCount: 1,
        totalSpent: 1390,
        firstOrderAt: new Date().toISOString(),
        lastOrderAt: new Date().toISOString(),
        isBlocked: false,
        notes: "Dine-in regular with kids",
      },
    ],
    [
      "03215551234",
      {
        phone: "03215551234",
        name: "Bilal Ahmed",
        ordersCount: 6,
        totalSpent: 12800,
        firstOrderAt: "2026-08-01T19:00:00.000Z",
        lastOrderAt: new Date().toISOString(),
        isBlocked: false,
        notes: "Crown Crust fan",
      },
    ],
    [
      "03337778899",
      {
        phone: "03337778899",
        name: "Fatima Noor",
        ordersCount: 3,
        totalSpent: 5120,
        firstOrderAt: "2026-10-05T20:15:00.000Z",
        lastOrderAt: new Date().toISOString(),
        lastAddress: "House 89, Sector 2, Satellite Town, Bahawalpur",
        isBlocked: false,
      },
    ],
  ]);
}

if (!globalStore.__RIMJHIM_SETTINGS) {
  globalStore.__RIMJHIM_SETTINGS = { ...STORE_SETTINGS };
}
if (!globalStore.__RIMJHIM_ITEMS) {
  globalStore.__RIMJHIM_ITEMS = MENU_ITEMS_DATA.map((item) => ({
    ...item,
    isAvailable: item.isAvailable !== false,
  }));
}
if (!globalStore.__RIMJHIM_ZONES) {
  globalStore.__RIMJHIM_ZONES = [...DELIVERY_ZONES_DATA];
}
if (!globalStore.__RIMJHIM_SSE_CLIENTS) {
  globalStore.__RIMJHIM_SSE_CLIENTS = new Set();
}
if (!globalStore.__RIMJHIM_CURRENT_SHIFT) {
  globalStore.__RIMJHIM_CURRENT_SHIFT = {
    id: "shift-1",
    openedBy: "Counter Cashier",
    openedAt: new Date().toISOString(),
    openingCash: 5000,
    status: "OPEN",
  };
}

export const mockDb = {
  // Orders
  getOrders: () => globalStore.__RIMJHIM_ORDERS || [],

  getOrderByIdOrNo: (query: string) => {
    if (!query) return null;
    const clean = query.trim().toLowerCase();
    const orders = globalStore.__RIMJHIM_ORDERS || [];
    
    // Check by ID or OrderNo
    const match = orders.find(
      (o) => o.id.toLowerCase() === clean || o.orderNo.toLowerCase() === clean
    );
    if (match) return match;

    // Check by phone number
    const byPhone = orders.find((o) => o.customerPhone.replace(/[^0-9]/g, "") === clean.replace(/[^0-9]/g, ""));
    return byPhone || null;
  },

  getOrdersByPhone: (phone: string) => {
    if (!phone) return [];
    const clean = phone.replace(/[^0-9]/g, "");
    return (globalStore.__RIMJHIM_ORDERS || []).filter(
      (o) => o.customerPhone.replace(/[^0-9]/g, "") === clean
    );
  },

  createOrder: (orderInput: Omit<OrderRecord, "id" | "orderNo" | "businessDay" | "createdAt" | "status">) => {
    const { orderNo } = generateOrderNumber(4);
    const id = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    // Check if customer is first time
    const existingCustomer = globalStore.__RIMJHIM_CUSTOMERS?.get(orderInput.customerPhone);
    const isFirstOrder = !existingCustomer || existingCustomer.ordersCount === 0;

    const newOrder: OrderRecord = {
      ...orderInput,
      id,
      orderNo,
      businessDay: new Date().toISOString().slice(0, 10),
      createdAt: now,
      status: "NEW",
      isFirstOrder,
    };

    globalStore.__RIMJHIM_ORDERS?.unshift(newOrder);

    // Upsert customer
    mockDb.upsertCustomer(orderInput.customerPhone, orderInput.customerName, orderInput.address, orderInput.total);

    // Broadcast to SSE clients
    mockDb.broadcast("order.created", newOrder);

    return newOrder;
  },

  updateOrderStatus: (
    idOrNo: string,
    status: OrderRecord["status"],
    etaMinutes?: number,
    cancelReason?: string
  ) => {
    const order = mockDb.getOrderByIdOrNo(idOrNo);
    if (!order) return null;

    order.status = status;
    if (etaMinutes !== undefined) order.etaMinutes = etaMinutes;
    if (cancelReason !== undefined) order.cancelReason = cancelReason;

    mockDb.broadcast("order.updated", order);
    return order;
  },

  // Customers CRM
  upsertCustomer: (phone: string, name: string, address?: string, amountSpent: number = 0) => {
    const customers = globalStore.__RIMJHIM_CUSTOMERS!;
    const now = new Date().toISOString();
    const existing = customers.get(phone);

    if (existing) {
      existing.name = name || existing.name;
      existing.ordersCount += 1;
      existing.totalSpent += amountSpent;
      existing.lastOrderAt = now;
      if (address) existing.lastAddress = address;
    } else {
      customers.set(phone, {
        phone,
        name: name || "Guest Customer",
        ordersCount: 1,
        totalSpent: amountSpent,
        firstOrderAt: now,
        lastOrderAt: now,
        lastAddress: address,
        isBlocked: false,
      });
    }
  },

  getCustomers: () => Array.from(globalStore.__RIMJHIM_CUSTOMERS?.values() || []),

  getCustomerByPhone: (phone: string) => globalStore.__RIMJHIM_CUSTOMERS?.get(phone) || null,

  toggleBlockCustomer: (phone: string) => {
    const customer = globalStore.__RIMJHIM_CUSTOMERS?.get(phone);
    if (!customer) return null;
    customer.isBlocked = !customer.isBlocked;
    return customer;
  },

  updateCustomerNotes: (phone: string, notes: string) => {
    const customer = globalStore.__RIMJHIM_CUSTOMERS?.get(phone);
    if (!customer) return null;
    customer.notes = notes;
    return customer;
  },

  // Staff Users
  getStaffUsers: (): StaffRecord[] => globalStore.__RIMJHIM_STAFF || [],

  updateStaffPin: (id: string, pin: string) => {
    const staff = (globalStore.__RIMJHIM_STAFF || []).find((s) => s.id === id);
    if (!staff) return null;
    staff.pin = pin.trim();
    return staff;
  },

  createStaffUser: (input: Omit<StaffRecord, "id" | "createdAt">) => {
    const newStaff: StaffRecord = {
      ...input,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    globalStore.__RIMJHIM_STAFF = [...(globalStore.__RIMJHIM_STAFF || []), newStaff];
    return newStaff;
  },

  toggleStaffStatus: (id: string) => {
    const staff = (globalStore.__RIMJHIM_STAFF || []).find((s) => s.id === id);
    if (!staff) return null;
    staff.isActive = !staff.isActive;
    return staff;
  },

  deleteStaffUser: (id: string) => {
    globalStore.__RIMJHIM_STAFF = (globalStore.__RIMJHIM_STAFF || []).filter((s) => s.id !== id);
    return true;
  },

  // Shifts
  getCurrentShift: () => globalStore.__RIMJHIM_CURRENT_SHIFT,

  openShift: (cashierName: string, openingCash: number) => {
    const shift: ShiftRecord = {
      id: `shift-${Date.now()}`,
      openedBy: cashierName,
      openedAt: new Date().toISOString(),
      openingCash,
      status: "OPEN",
    };
    globalStore.__RIMJHIM_CURRENT_SHIFT = shift;
    return shift;
  },

  closeShift: (cashierName: string, countedCash: number) => {
    const current = globalStore.__RIMJHIM_CURRENT_SHIFT;
    if (!current) return null;

    const cashSales = (globalStore.__RIMJHIM_ORDERS || [])
      .filter((o) => o.paymentMethod === "CASH" && o.status === "COMPLETED")
      .reduce((sum, o) => sum + o.total, 0);

    current.closedBy = cashierName;
    current.closedAt = new Date().toISOString();
    current.countedCash = countedCash;
    current.expectedCash = current.openingCash + cashSales;
    current.status = "CLOSED";

    return current;
  },

  // Menu Items & Settings
  getCategories: () => CATEGORIES_DATA,
  getItems: () => globalStore.__RIMJHIM_ITEMS || MENU_ITEMS_DATA,
  getZones: () => globalStore.__RIMJHIM_ZONES || DELIVERY_ZONES_DATA,
  getSettings: () => globalStore.__RIMJHIM_SETTINGS || STORE_SETTINGS,

  createMenuItem: (itemInput: Omit<MenuItemSeed, "id" | "slug">) => {
    const id = `item-${Date.now()}`;
    const slug = itemInput.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newItem: MenuItemSeed = {
      ...itemInput,
      id,
      slug,
      isAvailable: true,
    };
    globalStore.__RIMJHIM_ITEMS = [newItem, ...(globalStore.__RIMJHIM_ITEMS || [])];
    mockDb.broadcast("menu.updated", newItem);
    return newItem;
  },

  updateMenuItem: (id: string, updates: Partial<MenuItemSeed>) => {
    const items = globalStore.__RIMJHIM_ITEMS || [];
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;

    items[index] = { ...items[index], ...updates };
    mockDb.broadcast("menu.updated", items[index]);
    return items[index];
  },

  deleteMenuItem: (id: string) => {
    const items = globalStore.__RIMJHIM_ITEMS || [];
    globalStore.__RIMJHIM_ITEMS = items.filter((i) => i.id !== id);
    mockDb.broadcast("menu.updated", { deletedId: id });
    return true;
  },

  toggleItemAvailability: (itemId: string, available?: boolean) => {
    const items = globalStore.__RIMJHIM_ITEMS || [];
    const item = items.find((i) => i.id === itemId);
    if (!item) return null;
    item.isAvailable = available !== undefined ? available : !(item.isAvailable !== false);
    mockDb.broadcast("menu.updated", item);
    return item;
  },

  applyBulkPriceAdjustment: (percentage: number, roundToTen: boolean = true) => {
    const items = globalStore.__RIMJHIM_ITEMS || [];
    items.forEach((item) => {
      item.variants = item.variants.map((v) => {
        let newPrice = v.price * (1 + percentage / 100);
        if (roundToTen) {
          newPrice = Math.round(newPrice / 10) * 10;
        } else {
          newPrice = Math.round(newPrice);
        }
        return { ...v, price: Math.max(10, newPrice) };
      });
    });
    mockDb.broadcast("menu.updated", items);
    return items;
  },

  updateDeliveryZones: (zones: DeliveryZoneSeed[]) => {
    globalStore.__RIMJHIM_ZONES = zones;
    mockDb.broadcast("zones.updated", zones);
    return zones;
  },

  updateStoreSettings: (settings: Partial<typeof STORE_SETTINGS>) => {
    globalStore.__RIMJHIM_SETTINGS = {
      ...(globalStore.__RIMJHIM_SETTINGS || STORE_SETTINGS),
      ...settings,
    };
    mockDb.broadcast("settings.updated", globalStore.__RIMJHIM_SETTINGS);
    return globalStore.__RIMJHIM_SETTINGS;
  },

  // SSE Subscriptions
  subscribeSSE: (callback: (data: string) => void) => {
    globalStore.__RIMJHIM_SSE_CLIENTS?.add(callback);
    return () => {
      globalStore.__RIMJHIM_SSE_CLIENTS?.delete(callback);
    };
  },

  broadcast: (event: string, payload: unknown) => {
    const data = JSON.stringify({ event, payload });
    globalStore.__RIMJHIM_SSE_CLIENTS?.forEach((cb) => cb(data));
  },
};
