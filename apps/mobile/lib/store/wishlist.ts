import { create } from 'zustand';

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl?: string;
  price: number;
  mrp?: number;
  productType?: string;
  sellerName?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isWishlisted: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  isWishlisted: (productId: string) => get().items.some((i) => i.productId === productId),

  toggle: (item: WishlistItem) => {
    const exists = get().isWishlisted(item.productId);
    if (exists) {
      set((state) => ({ items: state.items.filter((i) => i.productId !== item.productId) }));
    } else {
      set((state) => ({ items: [...state.items, item] }));
    }
  },

  remove: (productId: string) => {
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
  },

  clear: () => set({ items: [] }),
}));
