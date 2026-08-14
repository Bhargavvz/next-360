'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Minus, Plus, Heart, Check, ShoppingBag, Leaf, ChevronRight, ShieldCheck,
  Truck, RotateCcw, Store, FileCheck, Star, MessageSquarePlus, Package,
} from 'lucide-react';
import { publicApi, api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Price } from '@/components/ui/price';
import { Rating } from '@/components/ui/rating';
import { EmptyState } from '@/components/ui/empty-state';
import { VerifiedSeal, TypeMark, CertificateId, PRODUCT_TYPES, type ProductType } from '@/components/brand/trust-mark';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingSummary, setRatingSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewOrderId, setReviewOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    publicApi
      .get(`/api/v1/products/${slug}`)
      .then((res) => {
        const p = res.data.data;
        setProduct(p);
        const pid = p?.id;
        if (!pid) return;

        publicApi
          .get(`/api/v1/products/${pid}/reviews?size=10`)
          .then((r) => setReviews(r.data.data?.content ?? []))
          .catch(() => {});
        publicApi
          .get(`/api/v1/products/${pid}/ratings`)
          .then((r) => setRatingSummary(r.data.data))
          .catch(() => {});

        if (isAuthenticated) {
          api
            .get(`/api/v1/wishlist/${pid}/check`)
            .then((r) => setWishlisted(r.data.data?.inWishlist ?? false))
            .catch(() => {});
          api
            .get('/api/v1/orders?size=50&status=DELIVERED')
            .then((r) => setEligibleOrders(r.data.data?.content ?? []))
            .catch(() => {});
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug, isAuthenticated]);

  const requireAuth = () =>
    toast.error('Sign in to continue', {
      action: { label: 'Sign in', onClick: () => (window.location.href = '/auth') },
    });

  const handleAddToCart = async () => {
    if (!isAuthenticated) return requireAuth();
    setAdding(true);
    try {
      await api.post('/api/v1/cart', { productId: product.id, quantity });
      setAdded(true);
      window.dispatchEvent(new CustomEvent('next360:cart-changed'));
      toast.success('Added to cart', { description: `${quantity} × ${product.name}` });
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not add to cart'));
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) return requireAuth();
    const next = !wishlisted;
    setWishlisted(next);
    try {
      if (next) await api.post('/api/v1/wishlist', { productId: product.id });
      else await api.delete(`/api/v1/wishlist/${product.id}`);
    } catch (err) {
      setWishlisted(!next);
      toast.error(apiErrorMessage(err, 'Could not update your wishlist'));
    }
  };

  const submitReview = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/v1/reviews', {
        productId: product.id,
        orderId: reviewOrderId || undefined,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Thanks — your review is live');
      setReviewOpen(false);
      setReviewTitle('');
      setReviewComment('');
      publicApi
        .get(`/api/v1/products/${product.id}/reviews?size=10`)
        .then((r) => setReviews(r.data.data?.content ?? []))
        .catch(() => {});
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not post your review'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="container py-20">
        <EmptyState
          icon={<Package />}
          title="We couldn’t find that product"
          description="It may have been delisted, or the link might be out of date."
          action={
            <Button asChild>
              <Link href="/products">Browse the catalogue</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const images: any[] = product.images?.length ? product.images : [];
  const stock = product.stock ?? 0;
  const inStock = stock > 0;
  const typeConfig = product.productType
    ? PRODUCT_TYPES[product.productType as ProductType]
    : undefined;

  return (
    <div className="pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="container flex items-center gap-1.5 py-5 text-sm text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-subtle-foreground" />
        <Link href="/products" className="transition-colors hover:text-foreground">
          Products
        </Link>
        {product.categoryName && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-subtle-foreground" />
            <span className="truncate">{product.categoryName}</span>
          </>
        )}
      </nav>

      <div className="container grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* ── Gallery ─────────────────────────────────────── */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-2xl bg-surface-sunken">
              <div className="aspect-[4/3]">
                {images[activeImage]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[activeImage].url}
                    alt={images[activeImage].altText || product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <Leaf className="h-16 w-16 text-border-strong" strokeWidth={1} />
                  </div>
                )}
              </div>

              <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                {product.isVerifiedOrganic ? (
                  <VerifiedSeal size="lg" />
                ) : (
                  <TypeMark type={product.productType} />
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-3">
                {images.map((img: any, i: number) => (
                  <button
                    key={img.id ?? i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={cn(
                      'h-20 w-20 overflow-hidden rounded-lg border-2 transition-all duration-200',
                      i === activeImage
                        ? 'border-primary'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Buy column ──────────────────────────────────── */}
        <div className="lg:col-span-5">
          {product.sellerName && (
            <Link
              href={`/products?query=${encodeURIComponent(product.sellerName)}`}
              className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-primary"
            >
              <Store className="h-3 w-3" />
              {product.sellerName}
            </Link>
          )}

          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-balance text-foreground md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Rating value={product.rating} count={product.reviewCount} size="md" />
            {inStock ? (
              stock <= 5 ? (
                <Badge variant="warning">Only {stock} left</Badge>
              ) : (
                <Badge variant="success">In stock</Badge>
              )
            ) : (
              <Badge variant="destructive">Out of stock</Badge>
            )}
          </div>

          <div className="mt-6">
            <Price value={product.price} mrp={product.mrp} size="xl" showSavings />
            <p className="mt-1.5 text-xs text-subtle-foreground">Inclusive of all taxes</p>
          </div>

          {/* Trust panel — the reason this marketplace exists, given real estate. */}
          {product.isVerifiedOrganic ? (
            <Card variant="seal" padding="md" className="mt-7">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-seal/12 text-seal">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    NPOP certificate verified
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Our team checked this seller&rsquo;s certificate against this listing.
                  </p>
                  {product.verificationId && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <CertificateId id={product.verificationId} />
                      <Link
                        href={`/verify/${product.verificationId}`}
                        className="text-xs font-medium text-seal underline-offset-2 hover:underline"
                      >
                        View certificate
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : typeConfig ? (
            <Card variant="flat" padding="md" className="mt-7">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <typeConfig.Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {typeConfig.label} — seller-declared
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    This claim comes from the seller, who is KYC-verified. It does not carry an
                    organic certificate.
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {/* Quantity + actions (desktop; mobile uses the sticky bar) */}
          <div className="mt-7 hidden gap-3 lg:flex">
            <div className="flex h-12 items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="grid h-full w-11 place-items-center rounded-l-lg text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-medium tabular">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                disabled={quantity >= stock}
                aria-label="Increase quantity"
                className="grid h-full w-11 place-items-center rounded-r-lg text-foreground transition-colors hover:bg-surface-hover disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              loading={adding}
              disabled={!inStock}
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              {added ? 'Added' : inStock ? 'Add to cart' : 'Out of stock'}
            </Button>

            <Button
              size="icon-lg"
              variant="secondary"
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={wishlisted}
            >
              <Heart
                className={cn('h-5 w-5', wishlisted && 'fill-destructive text-destructive')}
              />
            </Button>
          </div>

          {/* Service promises */}
          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-6">
            {[
              { Icon: Truck, label: 'Ships from source' },
              { Icon: FileCheck, label: 'KYC-verified seller' },
              { Icon: RotateCcw, label: 'Easy returns' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <Icon className="h-4.5 w-4.5 text-primary" />
                <span className="text-xs leading-snug text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Details */}
          {(product.description || product.ingredients || product.origin) && (
            <div className="mt-8 space-y-5 border-t border-border pt-7">
              {product.description && (
                <div>
                  <h2 className="text-sm font-medium text-foreground">About this product</h2>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </div>
              )}

              <dl className="space-y-2.5 text-sm">
                {[
                  ['Ingredients', product.ingredients],
                  ['Origin', product.origin],
                  ['Weight', product.weight],
                  ['Storage', product.storageInstructions],
                  ['SKU', product.sku],
                ]
                  .filter(([, v]) => !!v)
                  .map(([label, value]) => (
                    <div key={String(label)} className="flex gap-4">
                      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
                      <dd className="text-pretty text-foreground">{String(value)}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews ───────────────────────────────────────── */}
      <section className="container mt-16 border-t border-border pt-14 md:mt-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              What buyers say
            </h2>

            {ratingSummary?.average ? (
              <div className="mt-5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-semibold text-foreground tabular">
                    {Number(ratingSummary.average).toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">out of 5</span>
                </div>
                <Rating value={ratingSummary.average} size="md" showValue={false} className="mt-2" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {ratingSummary.total ?? reviews.length} verified reviews
                </p>

                {/* Distribution bars */}
                {ratingSummary.distribution && (
                  <div className="mt-5 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingSummary.distribution?.[star] ?? 0;
                      const total = ratingSummary.total || 1;
                      return (
                        <div key={star} className="flex items-center gap-2.5 text-xs">
                          <span className="w-3 tabular text-muted-foreground">{star}</span>
                          <Star className="h-3 w-3 shrink-0 fill-seal text-seal" />
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-seal transition-[width] duration-500 ease-natural"
                              style={{ width: `${(count / total) * 100}%` }}
                            />
                          </div>
                          <span className="w-6 text-right tabular text-subtle-foreground">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No reviews yet. Only buyers who received this product can leave one.
              </p>
            )}

            {isAuthenticated && eligibleOrders.length > 0 && !reviewOpen && (
              <Button variant="secondary" className="mt-6" onClick={() => setReviewOpen(true)}>
                <MessageSquarePlus className="h-4 w-4" />
                Write a review
              </Button>
            )}
          </div>

          <div className="lg:col-span-8">
            {reviewOpen && (
              <Card padding="lg" className="mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Write your review
                </h3>

                <div className="mt-5 space-y-4">
                  <div>
                    <span className="mb-2 block text-sm font-medium text-foreground">Rating</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setReviewRating(n)}
                          aria-label={`${n} star${n > 1 ? 's' : ''}`}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              'h-7 w-7',
                              n <= reviewRating
                                ? 'fill-seal text-seal'
                                : 'fill-muted text-border-strong'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {eligibleOrders.length > 0 && (
                    <div>
                      <label
                        htmlFor="review-order"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                      >
                        Which order?
                      </label>
                      <select
                        id="review-order"
                        value={reviewOrderId}
                        onChange={(e) => setReviewOrderId(e.target.value)}
                        className="h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-base text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12"
                      >
                        <option value="">Select an order</option>
                        {eligibleOrders.map((o: any) => (
                          <option key={o.id} value={o.id}>
                            {o.orderNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Input
                    label="Title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Sum it up in a few words"
                  />
                  <Textarea
                    label="Your review"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="How was the quality, packaging and delivery?"
                  />

                  <div className="flex gap-3">
                    <Button onClick={submitReview} loading={submitting}>
                      Post review
                    </Button>
                    <Button variant="ghost" onClick={() => setReviewOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {reviews.length === 0 ? (
              <EmptyState
                icon={<Star />}
                title="No reviews yet"
                description="Reviews here come only from buyers with a delivered order for this product, so there is nothing to pad the numbers with."
              />
            ) : (
              <div className="divide-y divide-border">
                {reviews.map((review: any) => (
                  <article key={review.id} className="py-6 first:pt-0">
                    <div className="flex items-center gap-3">
                      <Rating value={review.rating} size="sm" showValue={false} />
                      {review.isVerifiedPurchase && (
                        <Badge variant="success" size="sm">
                          Verified purchase
                        </Badge>
                      )}
                    </div>
                    {review.title && (
                      <h3 className="mt-2.5 font-medium text-foreground">{review.title}</h3>
                    )}
                    {review.comment && (
                      <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-subtle-foreground">
                      {review.userName ?? 'Verified buyer'}
                      {review.createdAt &&
                        ` · ${new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}`}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Sticky buy bar (mobile) ───────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 frost border-t border-border p-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <Price value={product.price} mrp={product.mrp} size="md" />
          </div>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            loading={adding}
            disabled={!inStock}
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {added ? 'Added' : inStock ? 'Add to cart' : 'Out of stock'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="container py-10">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
