import { OrderStatus, PaymentStatus, RefundStatus, ReturnReason } from '../enums';

/** Customer order */
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddressId: string;
  couponCode?: string;
  items: OrderItem[];
  sellerOrders: SellerOrder[];
  createdAt: string;
  updatedAt: string;
}

/** Order item */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
}

/** Seller-specific view of an order */
export interface SellerOrder {
  id: string;
  orderId: string;
  sellerId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  commissionAmount: number;
  commissionPercentage: number;
  netAmount: number;
  trackingNumber?: string;
  courierName?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Shipment tracking */
export interface Shipment {
  id: string;
  sellerOrderId: string;
  trackingNumber: string;
  courierName: string;
  status: OrderStatus;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingUrl?: string;
}

/** Return request */
export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  reason: ReturnReason;
  description: string;
  images?: string[];
  status: string;
  sellerResponse?: string;
  refundStatus?: RefundStatus;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

/** Refund record */
export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: RefundStatus;
  paymentId: string;
  processedAt?: string;
  createdAt: string;
}

/** Checkout request */
export interface CheckoutRequest {
  addressId: string;
  couponCode?: string;
  paymentMethod: string;
  deliveryNotes?: string;
}
