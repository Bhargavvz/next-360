import { CertificateStatus } from '../enums';

/** Certificate information */
export interface Certificate {
  id: string;
  certificateNumber: string;
  certificationBody: string;
  sellerId: string;
  productId: string;
  issueDate: string;
  expiryDate: string;
  documentUrl: string;
  status: CertificateStatus;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  revocationReason?: string;
}

/** Certificate verification view for admin */
export interface CertificateVerificationView {
  certificate: Certificate;
  productName: string;
  sellerName: string;
  sellerStatus: string;
  previousCertificates?: Certificate[];
}

/** QR verification result */
export interface QrVerificationResult {
  productId: string;
  productName: string;
  productType: string;
  isVerified: boolean;
  certificateNumber?: string;
  certificateStatus?: CertificateStatus;
  certificationBody?: string;
  sellerName: string;
  sellerVerified: boolean;
  verifiedAt?: string;
}
