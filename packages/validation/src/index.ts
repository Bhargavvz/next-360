// ============================================================
// Next360 — Shared Zod Validation Schemas
// ============================================================

import { z } from 'zod';

// --- Auth ---

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number');

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

export const otpRequestSchema = z.object({
  phone: phoneSchema,
});

export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
});

// --- User ---

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Please enter a valid email').optional(),
});

// --- Address ---

export const addressSchema = z.object({
  type: z.enum(['HOME', 'WORK', 'OTHER']),
  name: z.string().min(2, 'Name is required').max(100),
  phone: phoneSchema,
  addressLine1: z.string().min(5, 'Address is required').max(255),
  addressLine2: z.string().max(255).optional(),
  landmark: z.string().max(255).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit pincode'),
  isDefault: z.boolean().optional(),
  deliveryInstructions: z.string().max(500).optional(),
});

// --- Seller ---

export const sellerRegistrationSchema = z.object({
  businessName: z.string().min(3, 'Business name must be at least 3 characters').max(200),
  businessDescription: z.string().max(2000).optional(),
  businessAddress: z.string().min(10, 'Business address is required').max(500),
  gstin: z
    .string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format')
    .optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, 'Invalid PAN number format'),
  phone: phoneSchema,
  email: z.string().email('Please enter a valid email'),
});

// --- Product ---

export const createProductSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  price: z.number().positive('Price must be greater than 0'),
  mrp: z.number().positive('MRP must be greater than 0').optional(),
  categoryId: z.string().uuid('Please select a category'),
  productType: z.enum(['ORGANIC', 'NATURAL', 'ECO_FRIENDLY']),
  sku: z.string().max(50).optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  weight: z.string().max(50).optional(),
  dimensions: z.string().max(100).optional(),
  ingredients: z.string().max(2000).optional(),
  nutritionalInfo: z.string().max(2000).optional(),
  origin: z.string().max(200).optional(),
  storageInstructions: z.string().max(500).optional(),
});

// --- Review ---

export const createReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().max(200).optional(),
  comment: z.string().min(10, 'Review must be at least 10 characters').max(2000),
});

// --- Cart ---

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 items'),
});

// --- Checkout ---

export const checkoutSchema = z.object({
  addressId: z.string().uuid('Please select a delivery address'),
  couponCode: z.string().max(50).optional(),
  paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'COD']),
  deliveryNotes: z.string().max(500).optional(),
});

// --- Coupon ---

export const applyCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
});

// --- Support ---

export const createSupportTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  category: z.string().min(1, 'Please select a category'),
});

// Export types inferred from schemas
export type OtpRequest = z.infer<typeof otpRequestSchema>;
export type OtpVerify = z.infer<typeof otpVerifySchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type SellerRegistration = z.infer<typeof sellerRegistrationSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type CreateReview = z.infer<typeof createReviewSchema>;
export type AddToCart = z.infer<typeof addToCartSchema>;
export type Checkout = z.infer<typeof checkoutSchema>;
export type ApplyCoupon = z.infer<typeof applyCouponSchema>;
export type CreateSupportTicket = z.infer<typeof createSupportTicketSchema>;
