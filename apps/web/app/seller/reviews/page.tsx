'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Seller sees reviews for their products through their orders / products
    // Reviews are listed per product — fetch seller products and reviews
    api.get('/api/v1/seller/products?size=100')
      .then(async res => {
        const products = res.data.data?.content || [];
        const allReviews: any[] = [];
        await Promise.all(
          products.slice(0, 10).map((p: any) =>
            api.get(`/api/v1/products/${p.id}/reviews?size=20`)
              .then(r => {
                const revs = (r.data.data?.content || []).map((rev: any) => ({
                  ...rev,
                  productName: p.name,
                  productId: p.id,
                }));
                allReviews.push(...revs);
              })
              .catch(() => {})
          )
        );
        setReviews(allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sendResponse = async (reviewId: string) => {
    const text = responses[reviewId];
    if (!text?.trim()) return;
    setResponding(reviewId); setError(null);
    try {
      await api.post(`/api/v1/seller/reviews/${reviewId}/respond`, { response: text });
      setSent(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, sellerResponse: text } : r));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send response');
    } finally {
      setResponding(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display">Customer Reviews</h1>
        <p className="text-muted-foreground mt-1">Respond to reviews on your products</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-xl" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">Customer reviews on your products will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{review.productName}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-warning-muted text-warning text-xs font-bold px-2 py-0.5 rounded">
                      <Star className="h-3 w-3 fill-current" />{review.rating}
                    </div>
                    <span className="text-sm font-medium">{review.reviewerName || 'Anonymous'}</span>
                    {review.isVerifiedPurchase && (
                      <span className="text-[10px] text-success font-semibold">Verified Purchase</span>
                    )}
                  </div>
                </div>
                {review.createdAt && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(review.createdAt).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
              {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
              <p className="text-sm text-muted-foreground">{review.comment}</p>

              {/* Existing seller response */}
              {review.sellerResponse && (
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs font-semibold text-primary mb-1">Your Response</p>
                  <p className="text-sm text-muted-foreground">{review.sellerResponse}</p>
                </div>
              )}

              {/* Response form */}
              {!review.sellerResponse && (
                <div className="mt-3 space-y-2">
                  <textarea
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px]"
                    placeholder="Write a response to this review…"
                    value={responses[review.id] || ''}
                    onChange={e => setResponses(prev => ({ ...prev, [review.id]: e.target.value }))}
                  />
                  <Button
                    size="sm"
                    onClick={() => sendResponse(review.id)}
                    disabled={responding === review.id || !responses[review.id]?.trim()}
                  >
                    {responding === review.id ? 'Sending...' : sent === review.id ? 'Sent' : 'Send Response'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
