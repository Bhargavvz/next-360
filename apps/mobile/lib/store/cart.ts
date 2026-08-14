import { create } from 'zustand';
import { api, apiErrorMessage } from '../api';

/**
 * A cart line as returned by the API.
 *
 * `id` is the server-side cart item id used for updates and removal; `productId` is kept
 * so screens can still look items up by product.
 */
export interface CartItem {
  id: string;
  productId: string;
  slug?: string;
  name: string;
  imageUrl?: string;
  price: number;
  mrp?: number;
  variantId?: string | null;
  variantLabel?: string | null;
  sellerName?: string;
  quantity: number;
  stock: number;
  inStock: boolean;
}

export interface AppliedCoupon {
  code: string;
  description?: string;
  discountAmount: number;
}

/** Shape accepted by {@link CartState.addItem} — only the ids are actually needed. */
export interface AddToCartInput {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  /** Ignored by the server (prices always come from live product data). */
  [key: string]: unknown;
}

interface CartState {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  loading: boolean;
  mutating: boolean;
  error: string | null;

  /** Line-item subtotal at current selling prices. */
  subtotalAmount: number;
  /** Delivery fee for this subtotal, as computed by the server. */
  shippingAmount: number;
  /** Spend needed to unlock free delivery; 0 when already free. */
  freeDeliveryRemaining: number;
  /** True when a line exceeds available stock. */
  hasStockIssues: boolean;

  // Getters kept as functions for the screens that already call them.
  totalItems: () => number;
  subtotal: () => number;
  total: () => number;

  hydrate: () => Promise<void>;
  addItem: (item: AddToCartInput) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  clearCoupon: () => void;
  clearCart: () => Promise<void>;
  reset: () => void;
}

interface CartPayload {
  items?: any[];
  subtotal?: number;
  shippingAmount?: number;
  totalAmount?: number;
  freeDeliveryRemaining?: number;
  hasStockIssues?: boolean;
}

function mapItems(payload: CartPayload): CartItem[] {
  return (payload.items ?? []).map((item: any) => ({
    id: item.id,
    productId: item.productId,
    slug: item.productSlug,
    name: item.productName,
    imageUrl: item.productImageUrl ?? undefined,
    price: Number(item.unitPrice ?? 0),
    mrp: item.unitMrp != null ? Number(item.unitMrp) : undefined,
    variantId: item.variantId ?? null,
    variantLabel:
      item.variantName && item.variantValue ? `${item.variantName}: ${item.variantValue}` : null,
    quantity: item.quantity ?? 0,
    stock: item.availableStock ?? 0,
    inStock: item.inStock ?? true,
  }));
}

/**
 * Cart state backed by the server cart.
 *
 * Orders are built from the server-side cart, so a purely local cart would always place
 * an empty order. Every mutation goes through the API and the store re-hydrates from the
 * response, which also keeps prices, stock and delivery fees authoritative.
 */
export const useCartStore = create<CartState>((set, get) => {
  const applyPayload = (payload: CartPayload) => {
    const subtotal = Number(payload.subtotal ?? 0);
    set({
      items: mapItems(payload),
      subtotalAmount: subtotal,
      shippingAmount: Number(payload.shippingAmount ?? 0),
      freeDeliveryRemaining: Number(payload.freeDeliveryRemaining ?? 0),
      hasStockIssues: Boolean(payload.hasStockIssues),
      error: null,
    });
  };

  /** Find the server cart item id for a product; needed by the quantity/remove APIs. */
  const lineFor = (productId: string) => get().items.find((i) => i.productId === productId);

  return {
    items: [],
    coupon: null,
    loading: false,
    mutating: false,
    error: null,
    subtotalAmount: 0,
    shippingAmount: 0,
    freeDeliveryRemaining: 0,
    hasStockIssues: false,

    totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

    subtotal: () => get().subtotalAmount,

    total: () => {
      const { subtotalAmount, shippingAmount, coupon } = get();
      return Math.max(0, subtotalAmount - (coupon?.discountAmount ?? 0) + shippingAmount);
    },

    hydrate: async () => {
      set({ loading: true });
      try {
        const res = await api.get('/api/v1/cart');
        applyPayload(res.data.data ?? {});
      } catch (err) {
        set({ error: apiErrorMessage(err, 'Could not load your cart') });
      } finally {
        set({ loading: false });
      }
    },

    addItem: async (item) => {
      set({ mutating: true });
      try {
        const res = await api.post('/api/v1/cart', {
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity ?? 1,
        });
        applyPayload(res.data.data ?? {});
      } catch (err) {
        const message = apiErrorMessage(err, 'Could not add this item to your cart');
        set({ error: message });
        throw new Error(message);
      } finally {
        set({ mutating: false });
      }
    },

    removeItem: async (productId) => {
      const line = lineFor(productId);
      if (!line) return;
      set({ mutating: true });
      try {
        const res = await api.delete(`/api/v1/cart/${line.id}`);
        applyPayload(res.data.data ?? {});
      } catch (err) {
        set({ error: apiErrorMessage(err, 'Could not remove this item') });
      } finally {
        set({ mutating: false });
      }
    },

    updateQuantity: async (productId, quantity) => {
      const line = lineFor(productId);
      if (!line) return;
      if (quantity <= 0) {
        await get().removeItem(productId);
        return;
      }

      set({ mutating: true });
      try {
        const res = await api.put(`/api/v1/cart/${line.id}?quantity=${quantity}`);
        applyPayload(res.data.data ?? {});
      } catch (err) {
        const message = apiErrorMessage(err, 'Could not update the quantity');
        set({ error: message });
        // Re-sync so the UI never shows a quantity the server rejected.
        await get().hydrate();
        throw new Error(message);
      } finally {
        set({ mutating: false });
      }
    },

    applyCoupon: async (code) => {
      try {
        const res = await api.post('/api/v1/cart/coupon', { couponCode: code });
        const data = res.data.data;
        const discount = Number(data.discountAmount ?? 0);
        set({ coupon: { code: data.code, description: data.description, discountAmount: discount } });
        return { success: true, message: `Coupon applied — you save ₹${discount.toLocaleString('en-IN')}` };
      } catch (err) {
        set({ coupon: null });
        return { success: false, message: apiErrorMessage(err, 'Invalid coupon code') };
      }
    },

    clearCoupon: () => set({ coupon: null }),

    clearCart: async () => {
      try {
        await api.delete('/api/v1/cart');
      } catch {
        // Fall through — the local reset below still leaves the UI consistent.
      }
      set({
        items: [],
        coupon: null,
        subtotalAmount: 0,
        shippingAmount: 0,
        freeDeliveryRemaining: 0,
        hasStockIssues: false,
      });
    },

    /** Local-only reset, used on sign-out. Does not touch the server cart. */
    reset: () =>
      set({
        items: [],
        coupon: null,
        subtotalAmount: 0,
        shippingAmount: 0,
        freeDeliveryRemaining: 0,
        hasStockIssues: false,
        error: null,
      }),
  };
});
