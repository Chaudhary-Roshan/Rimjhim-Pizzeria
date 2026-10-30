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
    dealComponents?: string[];
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

export interface ShiftTransaction {
  id: string;
  shiftId: string;
  type: "CASH_IN" | "SAFE_DROP" | "EXPENSE";
  amount: number;
  reason: string;
  staffName: string;
  createdAt: string;
}

export interface ShiftRecord {
  id: string;
  shiftNo?: string;
  openedBy: string;
  openedAt: string;
  openingCash: number;
  closedBy?: string;
  closedAt?: string;
  countedCash?: number;
  expectedCash?: number;
  status: "OPEN" | "CLOSED";
  notes?: string;
  totalSales?: number;
  cashSales?: number;
  cardSales?: number;
  jazzCashSales?: number;
  easyPaisaSales?: number;
  ordersCount?: number;
  dineInOrdersCount?: number;
  takeawayOrdersCount?: number;
  deliveryOrdersCount?: number;
  dineInSales?: number;
  takeawaySales?: number;
  deliverySales?: number;
  discountsTotal?: number;
  deliveryFeesTotal?: number;
  cashInTotal?: number;
  safeDropTotal?: number;
  expensesTotal?: number;
  transactions?: ShiftTransaction[];
}

// Global in-memory storage (persists across hot reloads in Next.js development)
const globalStore = global as unknown as {
  __RIMJHIM_ORDERS?: OrderRecord[];
  __RIMJHIM_CUSTOMERS?: Map<string, CustomerRecord>;
  __RIMJHIM_CURRENT_SHIFT?: ShiftRecord;
  __RIMJHIM_SHIFT_HISTORY?: ShiftRecord[];
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
  ];
}

if (!globalStore.__RIMJHIM_ORDERS) {
  globalStore.__RIMJHIM_ORDERS = [];
}

if (!globalStore.__RIMJHIM_CUSTOMERS) {
  globalStore.__RIMJHIM_CUSTOMERS = new Map();
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
// No default shift in production until opened by staff
globalStore.__RIMJHIM_CURRENT_SHIFT = undefined;

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
  getShiftHistory: () => globalStore.__RIMJHIM_SHIFT_HISTORY || [],

  openShift: (cashierName: string, openingCash: number) => {
    const d = new Date();
    const dateStr = d.toISOString().slice(2, 10).replace(/-/g, "");
    const shiftNo = `SH-${dateStr}-${(globalStore.__RIMJHIM_SHIFT_HISTORY?.length || 0) + 1}`;

    const shift: ShiftRecord = {
      id: `shift-${Date.now()}`,
      shiftNo,
      openedBy: cashierName,
      openedAt: d.toISOString(),
      openingCash,
      status: "OPEN",
      transactions: [],
      cashInTotal: 0,
      safeDropTotal: 0,
      expensesTotal: 0,
    };
    globalStore.__RIMJHIM_CURRENT_SHIFT = shift;
    return shift;
  },

  addShiftTransaction: (
    type: "CASH_IN" | "SAFE_DROP" | "EXPENSE",
    amount: number,
    reason: string,
    staffName: string
  ) => {
    const current = globalStore.__RIMJHIM_CURRENT_SHIFT;
    if (!current) return null;

    const tx: ShiftTransaction = {
      id: `tx-${Date.now()}`,
      shiftId: current.id,
      type,
      amount: Math.max(0, amount),
      reason: reason.trim(),
      staffName: staffName.trim() || current.openedBy,
      createdAt: new Date().toISOString(),
    };

    if (!current.transactions) current.transactions = [];
    current.transactions.push(tx);

    current.cashInTotal = current.transactions
      .filter((t) => t.type === "CASH_IN")
      .reduce((sum, t) => sum + t.amount, 0);

    current.safeDropTotal = current.transactions
      .filter((t) => t.type === "SAFE_DROP")
      .reduce((sum, t) => sum + t.amount, 0);

    current.expensesTotal = current.transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return tx;
  },

  closeShift: (cashierName: string, countedCash: number, notes?: string) => {
    const current = globalStore.__RIMJHIM_CURRENT_SHIFT;
    if (!current) return null;

    const allOrders = globalStore.__RIMJHIM_ORDERS || [];
    const shiftOrders = allOrders.filter(
      (o) =>
        o.status !== "CANCELLED" &&
        (o.paymentStatus === "PAID" || o.status === "COMPLETED") &&
        (!current.openedAt || new Date(o.createdAt) >= new Date(current.openedAt))
    );

    const cashSales = shiftOrders
      .filter((o) => o.paymentMethod === "CASH")
      .reduce((sum, o) => sum + o.total, 0);

    const cardSales = shiftOrders
      .filter((o) => o.paymentMethod === "CARD")
      .reduce((sum, o) => sum + o.total, 0);

    const jazzCashSales = shiftOrders
      .filter((o) => o.paymentMethod === "JAZZCASH")
      .reduce((sum, o) => sum + o.total, 0);

    const easyPaisaSales = shiftOrders
      .filter((o) => o.paymentMethod === "EASYPAISA")
      .reduce((sum, o) => sum + o.total, 0);

    const totalSales = cashSales + cardSales + jazzCashSales + easyPaisaSales;

    const dineInOrders = shiftOrders.filter((o) => o.type === "DINE_IN");
    const takeawayOrders = shiftOrders.filter((o) => o.type === "TAKEAWAY");
    const deliveryOrders = shiftOrders.filter((o) => o.type === "DELIVERY");

    const dineInSales = dineInOrders.reduce((sum, o) => sum + o.total, 0);
    const takeawaySales = takeawayOrders.reduce((sum, o) => sum + o.total, 0);
    const deliverySales = deliveryOrders.reduce((sum, o) => sum + o.total, 0);

    const discountsTotal = shiftOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const deliveryFeesTotal = shiftOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    const cashInTotal = (current.transactions || [])
      .filter((t) => t.type === "CASH_IN")
      .reduce((sum, t) => sum + t.amount, 0);

    const safeDropTotal = (current.transactions || [])
      .filter((t) => t.type === "SAFE_DROP")
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesTotal = (current.transactions || [])
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const netExpectedInDrawer =
      current.openingCash + cashSales + cashInTotal - safeDropTotal - expensesTotal;

    current.closedBy = cashierName;
    current.closedAt = new Date().toISOString();
    current.countedCash = countedCash;
    current.expectedCash = netExpectedInDrawer;
    current.status = "CLOSED";
    current.notes = notes || undefined;
    current.cashSales = cashSales;
    current.cardSales = cardSales;
    current.jazzCashSales = jazzCashSales;
    current.easyPaisaSales = easyPaisaSales;
    current.totalSales = totalSales;
    current.ordersCount = shiftOrders.length;
    current.dineInOrdersCount = dineInOrders.length;
    current.takeawayOrdersCount = takeawayOrders.length;
    current.deliveryOrdersCount = deliveryOrders.length;
    current.dineInSales = dineInSales;
    current.takeawaySales = takeawaySales;
    current.deliverySales = deliverySales;
    current.discountsTotal = discountsTotal;
    current.deliveryFeesTotal = deliveryFeesTotal;
    current.cashInTotal = cashInTotal;
    current.safeDropTotal = safeDropTotal;
    current.expensesTotal = expensesTotal;

    // Archive to history
    if (!globalStore.__RIMJHIM_SHIFT_HISTORY) {
      globalStore.__RIMJHIM_SHIFT_HISTORY = [];
    }
    globalStore.__RIMJHIM_SHIFT_HISTORY.unshift({ ...current });

    // Reset active shift
    globalStore.__RIMJHIM_CURRENT_SHIFT = undefined;

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
