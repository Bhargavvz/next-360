import { create } from 'zustand';
import { api } from '../api';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string;
  price: number;
  mrp?: number;
  sellerName?: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
  loading: boolean;

  // Getters
  totalItems: () => number;
  subtotal: () => number;
  total: () => number;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  clearCoupon: () => void;
  clearCart: () => void;
}

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 499;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  couponDiscount: 0,
  loading: false,

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

  subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  total: () => {
    const subtotal = get().subtotal();
    const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    return subtotal + delivery - get().couponDiscount;
  },

  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === newItem.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === newItem.productId
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...newItem, quantity: 1 }] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
      ),
    }));
  },

  applyCoupon: async (code: string) => {
    set({ loading: true });
    try {
      const res = await api.post('/api/v1/coupons/validate', { code, subtotal: get().subtotal() });
      const discount = res.data?.data?.discount || 0;
      set({ couponCode: code, couponDiscount: discount, loading: false });
      return { success: true, message: `Coupon applied! You save ₹${discount}` };
    } catch (err: any) {
      set({ loading: false });
      return { success: false, message: err.response?.data?.error?.message || 'Invalid coupon code' };
    }
  },

  clearCoupon: () => set({ couponCode: '', couponDiscount: 0 }),

  clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),
}));
