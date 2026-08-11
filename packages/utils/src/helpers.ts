// ============================================================
// Next360 — Helpers
// ============================================================

import { ProductType, CertificateStatus, SellerStatus, ProductStatus } from '@next360/types';

/**
 * Determines if a product should display as verified organic.
 *
 * Critical business rule: An organic product is only verified when ALL conditions are met:
 * 1. Product type is ORGANIC
 * 2. Certificate status is APPROVED
 * 3. Seller status is APPROVED
 * 4. Product status is APPROVED
 * 5. Certificate is not expired
 *
 * NOTE: This is a UI helper only. The backend is the authoritative source for verification status.
 */
export function isVerifiedOrganic(params: {
  productType: ProductType;
  certificateStatus?: CertificateStatus;
  sellerStatus?: SellerStatus;
  productStatus?: ProductStatus;
}): boolean {
  return (
    params.productType === ProductType.ORGANIC &&
    params.certificateStatus === CertificateStatus.APPROVED &&
    params.sellerStatus === SellerStatus.APPROVED &&
    params.productStatus === ProductStatus.APPROVED
  );
}

/**
 * Get the trust badge configuration for a product type
 */
export function getTrustBadge(productType: ProductType, isVerified: boolean) {
  switch (productType) {
    case ProductType.ORGANIC:
      return {
        label: isVerified ? '🟢 NPOP VERIFIED' : '⏳ Verification Pending',
        variant: isVerified ? ('verified' as const) : ('pending' as const),
        color: isVerified ? '#16a34a' : '#9ca3af',
      };
    case ProductType.NATURAL:
      return {
        label: '🟡 NATURAL — UNVERIFIED',
        variant: 'unverified' as const,
        color: '#d97706',
      };
    case ProductType.ECO_FRIENDLY:
      return {
        label: '🔵 ECO-FRIENDLY — UNVERIFIED',
        variant: 'unverified' as const,
        color: '#2563eb',
      };
    default:
      return {
        label: 'Unknown',
        variant: 'unknown' as const,
        color: '#6b7280',
      };
  }
}

/**
 * Build a product image URL from the storage path
 */
export function buildImageUrl(path: string, baseUrl?: string): string {
  if (path.startsWith('http')) return path;
  const base = baseUrl || process.env.NEXT_PUBLIC_CDN_URL || '';
  return `${base}/${path}`;
}

/**
 * Build the QR verification URL for a product
 */
export function buildVerificationUrl(productVerificationId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://next360.com';
  return `${baseUrl}/verify/${productVerificationId}`;
}

/**
 * Check if a certificate is expiring soon (within 30 days)
 */
export function isCertificateExpiringSoon(expiryDate: string, thresholdDays = 30): boolean {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= thresholdDays;
}

/**
 * Calculate days until certificate expiry
 */
export function daysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
