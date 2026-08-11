import { SellerStatus, KycStatus } from '../enums';

/** Seller profile */
export interface Seller {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  gstin?: string;
  panNumber?: string;
  phone: string;
  email: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: SellerStatus;
  kycStatus: KycStatus;
  rating?: number;
  totalOrders?: number;
  totalProducts?: number;
  commissionPercentage: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

/** Seller registration request */
export interface SellerRegistrationRequest {
  businessName: string;
  businessDescription?: string;
  businessAddress: string;
  gstin?: string;
  panNumber: string;
  phone: string;
  email: string;
}

/** Seller KYC document */
export interface SellerKyc {
  id: string;
  sellerId: string;
  documentType: string;
  documentUrl: string;
  status: KycStatus;
  rejectionReason?: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

/** Public seller storefront view */
export interface SellerStorefront {
  id: string;
  businessName: string;
  businessDescription?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating?: number;
  totalOrders: number;
  totalProducts: number;
  location?: string;
  isVerified: boolean;
  joinedAt: string;
}
