import { CouponType } from '../enums';

/** Coupon */
export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  categoryId?: string;
  sellerId?: string;
  productId?: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

/** Apply coupon request */
export interface ApplyCouponRequest {
  code: string;
}

/** Coupon validation result */
export interface CouponValidationResult {
  isValid: boolean;
  discount: number;
  message: string;
}
