import { PayoutStatus } from '../enums';

/** Seller payout record */
export interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  commissionDeducted: number;
  refundsDeducted: number;
  netAmount: number;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  processedAt?: string;
  transactionReference?: string;
  createdAt: string;
}

/** Seller earnings summary */
export interface EarningsSummary {
  totalSales: number;
  totalCommission: number;
  totalRefunds: number;
  netEarnings: number;
  pendingPayout: number;
  completedPayouts: number;
}
