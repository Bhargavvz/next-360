// ============================================================
// Next360 — Constants
// ============================================================

/** Application name */
export const APP_NAME = 'Next360';

/** Application tagline */
export const APP_TAGLINE = 'Shop verified. Buy with confidence.';

/** Default pagination size */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum file upload sizes (in bytes) */
export const FILE_LIMITS = {
  PRODUCT_IMAGE: 5 * 1024 * 1024, // 5MB
  CERTIFICATE: 10 * 1024 * 1024, // 10MB
  KYC_DOCUMENT: 10 * 1024 * 1024, // 10MB
  REVIEW_IMAGE: 3 * 1024 * 1024, // 3MB
  AVATAR: 2 * 1024 * 1024, // 2MB
} as const;

/** Allowed MIME types */
export const ALLOWED_MIME_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

/** Commission range */
export const COMMISSION = {
  MIN_PERCENTAGE: 10,
  MAX_PERCENTAGE: 20,
  DEFAULT_PERCENTAGE: 15,
} as const;

/** OTP configuration */
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 300, // 5 minutes
  MAX_ATTEMPTS: 5,
  COOLDOWN_SECONDS: 60,
} as const;

/** Product classification labels */
export const PRODUCT_TYPE_LABELS = {
  ORGANIC: {
    label: 'NPOP Verified',
    shortLabel: 'Verified Organic',
    icon: '🟢',
    color: '#16a34a',
  },
  NATURAL: {
    label: 'Natural — Unverified',
    shortLabel: 'Natural',
    icon: '🟡',
    color: '#d97706',
  },
  ECO_FRIENDLY: {
    label: 'Eco-Friendly — Unverified',
    shortLabel: 'Eco-Friendly',
    icon: '🔵',
    color: '#2563eb',
  },
} as const;

/** Order status labels for display */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded',
};

/** API paths */
export const API_PATHS = {
  AUTH: '/api/v1/auth',
  USERS: '/api/v1/users',
  SELLERS: '/api/v1/sellers',
  PRODUCTS: '/api/v1/products',
  CATEGORIES: '/api/v1/categories',
  CERTIFICATES: '/api/v1/certificates',
  CART: '/api/v1/cart',
  ORDERS: '/api/v1/orders',
  PAYMENTS: '/api/v1/payments',
  REVIEWS: '/api/v1/reviews',
  WISHLIST: '/api/v1/wishlist',
  NOTIFICATIONS: '/api/v1/notifications',
  COUPONS: '/api/v1/coupons',
  DISPUTES: '/api/v1/disputes',
  ADMIN: '/api/v1/admin',
  VERIFY: '/api/v1/verify',
} as const;
