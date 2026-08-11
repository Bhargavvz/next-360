/** Product review */
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  helpfulCount: number;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Create review request */
export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment: string;
}

/** Review summary for a product */
export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/** Wishlist item */
export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  price: number;
  mrp?: number;
  isInStock: boolean;
  addedAt: string;
}
