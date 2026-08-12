'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicApi, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Star, Minus, Plus, ShoppingCart, Heart, Truck, RotateCcw, Award, ChevronRight, Send, AlertCircle, CheckCircle, Leaf, Package } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingSummary, setRatingSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  // Review form
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewOrderId, setReviewOrderId] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    publicApi.get(`/api/v1/products/${slug}`)
      .then(res => {
        setProduct(res.data.data);
        const pid = res.data.data.id;
        publicApi.get(`/api/v1/products/${pid}/reviews?size=10`).then(r => setReviews(r.data.data?.content || [])).catch(() => {});
        publicApi.get(`/api/v1/products/${pid}/ratings`).then(r => setRatingSummary(r.data.data)).catch(() => {});
        if (isAuthenticated) {
          api.get(`/api/v1/wishlist/${pid}/check`).then(r => setInWishlist(r.data.data?.inWishlist ?? false)).catch(() => {});
          // Load delivered orders to allow writing a review
          api.get('/api/v1/orders?size=50&status=DELIVERED').then(r => {
            const orders = r.data.data?.content || [];
            const relevant = orders.filter((o: any) => o.items?.some((i: any) => i.productId === pid));
            setEligibleOrders(relevant);
          }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/auth'; return; }
    setAddingToCart(true);
    try {
      await api.post('/api/v1/cart', { productId: product.id, quantity });
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2500);
    } catch { }
    setAddingToCart(false);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { window.location.href = '/auth'; return; }
    const was = inWishlist;
    setInWishlist(!was);
    setWishlistLoading(true);
    try {
      if (was) await api.delete(`/api/v1/wishlist/${product.id}`);
      else await api.post(`/api/v1/wishlist/${product.id}`);
    } catch { setInWishlist(was); }
    setWishlistLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) { setReviewError('Please write a comment'); return; }
    if (!reviewOrderId) { setReviewError('Please select the order'); return; }
    setSubmittingReview(true); setReviewError('');
    try {
      await api.post('/api/v1/reviews', {
        productId: product.id,
        orderId: reviewOrderId,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setShowReviewForm(false);
      // Refresh reviews
      publicApi.get(`/api/v1/products/${product.id}/reviews?size=10`).then(r => setReviews(r.data.data?.content || [])).catch(() => {});
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-xl font-bold mb-2">Product not found</h2>
        <Link href="/products"><Button variant="outline">Browse Products</Button></Link>
      </div>
    );
  }

  const images = product.images || [];
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div className="container py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted/50 border">
            {product.images?.[0]?.url ? (
            <img src={product.images[selectedImage]?.url || product.images[0]?.url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Leaf className="h-20 w-20 text-muted-foreground/20" />
            </div>
          )}
            {product.isVerifiedOrganic && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                <ShieldCheck className="h-4 w-4" /> NPOP VERIFIED
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 h-20 w-20 rounded-xl overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent hover:border-border'}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <Badge variant={product.productType === 'ORGANIC' ? 'organic' : product.productType === 'NATURAL' ? 'natural' : 'eco'}>
              {product.productType === 'ORGANIC' ? 'Organic' : product.productType === 'NATURAL' ? 'Natural' : 'Eco-Friendly'}
            </Badge>
            {product.isVerifiedOrganic && <Badge variant="success"><ShieldCheck className="h-3 w-3" /> Verified</Badge>}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] leading-tight">{product.name}</h1>

          {product.sellerName && (
            <p className="text-sm text-muted-foreground">
              Sold by <span className="font-medium text-foreground">{product.sellerName}</span>
            </p>
          )}

          {/* Rating */}
          {ratingSummary && ratingSummary.averageRating && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-semibold">
                <Star className="h-4 w-4 fill-current" /> {ratingSummary.averageRating}
              </div>
              <span className="text-sm text-muted-foreground">{ratingSummary.totalReviews} reviews</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">₹{product.mrp?.toLocaleString('en-IN')}</span>
                <span className="text-sm font-semibold text-emerald-600">Save {discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="text-sm">
            {product.stock > 0 ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-destructive font-medium flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4" /> Out of Stock
              </span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-11 w-11 flex items-center justify-center hover:bg-accent transition-colors rounded-l-lg">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="h-11 w-11 flex items-center justify-center hover:bg-accent transition-colors rounded-r-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button size="lg" className="flex-1 shadow-lg shadow-primary/20" onClick={handleAddToCart} loading={addingToCart}>
                {cartAdded ? <><CheckCircle className="h-5 w-5" /> Added!</> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
              </Button>

              <Button size="lg" variant={inWishlist ? 'default' : 'outline'} className="shrink-0" onClick={toggleWishlist} loading={wishlistLoading}>
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>
          )}

          {/* Promises */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { icon: <Truck className="h-4 w-4" />, label: 'Free Delivery' },
              { icon: <RotateCcw className="h-4 w-4" />, label: '7-Day Returns' },
              { icon: <Award className="h-4 w-4" />, label: 'Quality Assured' },
            ].map(p => (
              <div key={p.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 text-center">
                <span className="text-muted-foreground">{p.icon}</span>
                <span className="text-xs font-medium">{p.label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <section className="mt-16 pt-8 border-t">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Customer Reviews</h2>
          {isAuthenticated && eligibleOrders.length > 0 && !reviewSuccess && (
            <Button size="sm" variant="outline" onClick={() => setShowReviewForm(!showReviewForm)}>
              <Send className="h-4 w-4" /> Write a Review
            </Button>
          )}
        </div>

        {reviewSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
            <CheckCircle className="h-5 w-5" /> Your review has been submitted!
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="rounded-2xl border bg-card p-6 mb-8">
            <h3 className="font-semibold mb-4">Write Your Review</h3>
            <div className="space-y-4">
              {/* Star rating */}
              <div>
                <label className="block text-sm font-medium mb-2">Rating *</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)} type="button">
                      <Star className={`h-7 w-7 transition-colors ${s <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              {/* Order selector */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Order *</label>
                <select value={reviewOrderId} onChange={e => setReviewOrderId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select order</option>
                  {eligibleOrders.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.orderNumber} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input type="text" placeholder="Summarize your experience" value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Review *</label>
                <textarea rows={4} placeholder="Tell others about your experience with this product..." value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              {reviewError && <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="h-4 w-4" />{reviewError}</p>}
              <div className="flex gap-3">
                <Button onClick={handleSubmitReview} loading={submittingReview}>Submit Review</Button>
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-12 rounded-xl border bg-card">
            <Star className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="p-5 rounded-xl border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                      <Star className="h-3 w-3 fill-current" /> {review.rating}
                    </div>
                    <span className="text-sm font-medium">{review.reviewerName}</span>
                  </div>
                  {review.isVerifiedPurchase && <Badge variant="success" className="text-[10px]">Verified Purchase</Badge>}
                </div>
                {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                {review.sellerResponse && (
                  <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="font-medium text-xs text-primary">Seller Response:</span>
                    <p className="text-muted-foreground mt-0.5">{review.sellerResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
