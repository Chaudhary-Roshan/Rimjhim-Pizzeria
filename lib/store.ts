import { create } from "zustand";

export interface CartModifier {
  group: string;
  option: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item uuid (hash of item + variant + modifiers)
  menuItemId: string;
  name: string;
  variantName: string;
  unitPrice: number; // base variant price + sum of priceDelta
  quantity: number;
  imageUrl?: string;
  modifiers: CartModifier[];
  note?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  orderType: "DELIVERY" | "TAKEAWAY";
  selectedZoneName: string;
  deliveryFee: number;
  customerName: string;
  customerPhone: string;
  address: string;
  landmark: string;
  customerNote: string;

  // Actions
  initStore: () => void;
  toggleCart: (open?: boolean) => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setOrderType: (type: "DELIVERY" | "TAKEAWAY") => void;
  setDeliveryZone: (zoneName: string, fee: number) => void;
  setCustomerDetails: (details: Partial<{
    customerName: string;
    customerPhone: string;
    address: string;
    landmark: string;
    customerNote: string;
  }>) => void;

  // Computed
  getSubtotal: () => number;
  getTotal: () => number;
  getTotalCount: () => number;
}

const LOCAL_STORAGE_KEY = "rimjhim_cart_v1";

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Failed to save cart to localStorage", err);
  }
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  hasHydrated: false,
  isOpen: false,
  orderType: "DELIVERY",
  selectedZoneName: "Satellite Town (Commercial & Residential)",
  deliveryFee: 100,
  customerName: "",
  customerPhone: "",
  address: "",
  landmark: "",
  customerNote: "",

  initStore: () => {
    if (get().hasHydrated) return;
    const stored = loadFromStorage();
    set({ items: stored, hasHydrated: true });
  },

  toggleCart: (open) => {
    set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen }));
  },

  addItem: (newItem) => {
    const modString = (newItem.modifiers || [])
      .map((m) => `${m.group}:${m.option}`)
      .sort()
      .join("|");
    const uniqueId = `${newItem.menuItemId}-${newItem.variantName}-${modString}`;

    set((state) => {
      const existingIndex = state.items.findIndex((item) => item.id === uniqueId);
      let updated: CartItem[];

      if (existingIndex > -1) {
        updated = [...state.items];
        updated[existingIndex].quantity += newItem.quantity;
      } else {
        updated = [...state.items, { ...newItem, id: uniqueId }];
      }

      saveToStorage(updated);
      return { items: updated, isOpen: true };
    });
  },

  updateQuantity: (id, delta) => {
    set((state) => {
      const updated = state.items
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      saveToStorage(updated);
      return { items: updated };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      saveToStorage(updated);
      return { items: updated };
    });
  },

  clearCart: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    set({ items: [] });
  },

  setOrderType: (type) => {
    set({
      orderType: type,
      deliveryFee: type === "DELIVERY" ? 100 : 0,
    });
  },

  setDeliveryZone: (zoneName, fee) => {
    set({
      selectedZoneName: zoneName,
      deliveryFee: fee,
    });
  },

  setCustomerDetails: (details) => {
    set((state) => ({
      customerName: details.customerName !== undefined ? details.customerName : state.customerName,
      customerPhone: details.customerPhone !== undefined ? details.customerPhone : state.customerPhone,
      address: details.address !== undefined ? details.address : state.address,
      landmark: details.landmark !== undefined ? details.landmark : state.landmark,
      customerNote: details.customerNote !== undefined ? details.customerNote : state.customerNote,
    }));
  },

  getSubtotal: () => {
    return get().items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  },

  getTotal: () => {
    const sub = get().getSubtotal();
    const fee = get().orderType === "DELIVERY" ? get().deliveryFee : 0;
    return sub + fee;
  },

  getTotalCount: () => {
    return get().items.reduce((acc, it) => acc + it.quantity, 0);
  },
}));
