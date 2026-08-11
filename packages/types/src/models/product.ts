import { ProductType, ProductStatus, CertificateStatus } from '../enums';

/** Product listing */
export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  mrp?: number;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  productType: ProductType;
  status: ProductStatus;
  images: ProductImage[];
  rating?: number;
  reviewCount: number;
  stock: number;
  sku?: string;
  weight?: string;
  dimensions?: string;
  ingredients?: string;
  nutritionalInfo?: string;
  origin?: string;
  storageInstructions?: string;
  isVerifiedOrganic: boolean;
  certificateStatus?: CertificateStatus;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

/** Product image */
export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

/** Product variant */
export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  sku?: string;
  price: number;
  mrp?: number;
  stock: number;
  weight?: string;
  images?: ProductImage[];
}

/** Product card (minimal info for listing) */
export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  price: number;
  mrp?: number;
  primaryImageUrl?: string;
  productType: ProductType;
  isVerifiedOrganic: boolean;
  rating?: number;
  reviewCount: number;
  sellerName: string;
  stock: number;
}

/** Category */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

/** Trust profile for a product */
export interface ProductTrustProfile {
  sellerVerified: boolean;
  certificateVerified: boolean;
  certificateValid: boolean;
  productApproved: boolean;
  hasVerifiedPurchaseReviews: boolean;
  certificateNumber?: string;
  certificationBody?: string;
  certificateIssueDate?: string;
  certificateExpiryDate?: string;
}

/** Product creation request */
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  mrp?: number;
  categoryId: string;
  productType: ProductType;
  sku?: string;
  stock: number;
  weight?: string;
  dimensions?: string;
  ingredients?: string;
  nutritionalInfo?: string;
  origin?: string;
  storageInstructions?: string;
  variants?: CreateVariantRequest[];
}

/** Variant creation request */
export interface CreateVariantRequest {
  name: string;
  value: string;
  sku?: string;
  price: number;
  mrp?: number;
  stock: number;
  weight?: string;
}

/** Product search/filter parameters */
export interface ProductFilterParams {
  query?: string;
  categoryId?: string;
  productType?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sellerId?: string;
  verifiedOnly?: boolean;
  inStock?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  size?: number;
}
