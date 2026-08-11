/** Shopping cart */
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discount: number;
  shippingEstimate: number;
  total: number;
  couponCode?: string;
  updatedAt: string;
}

/** Cart item */
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  variantId?: string;
  variantName?: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
  isInStock: boolean;
}

/** Add to cart request */
export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

/** Update cart item request */
export interface UpdateCartItemRequest {
  quantity: number;
}
