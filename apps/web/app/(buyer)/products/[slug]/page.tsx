'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicApi, api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Star, Minus, Plus, ShoppingCart, Heart, Truck, RotateCcw, Award, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    publicApi.get(`/api/v1/products/${slug}`)
      .then(res => {
        setProduct(res.data.data);
        const pid = res.data.data.id;
        publicApi.get(`/api/v1/products/${pid}/reviews?size=5`).then(r => setReviews(r.data.data?.content || [])).catch(() => {});
        publicApi.get(`/api/v1/products/${pid}/ratings`).then(r => setRatingSummary(r.data.data)).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/auth'; return; }
    setAddingToCart(true);
    try {
      await api.post('/api/v1/cart', { productId: product.id, quantity });
    } catch { }
    setAddingToCart(false);
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
        <div className="text-5xl mb-4">😕</div>
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
            {images.length > 0 ? (
              <img src={images[selectedImage]?.url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-6xl text-muted-foreground/30">🌿</div>
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
              {product.productType === 'ORGANIC' ? '🟢 Organic' : product.productType === 'NATURAL' ? '🟡 Natural' : '🔵 Eco-Friendly'}
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
              <span className="text-emerald-600 font-medium">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-destructive font-medium">✗ Out of Stock</span>
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
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>

              <Button size="lg" variant="outline" className="shrink-0">
                <Heart className="h-5 w-5" />
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

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16 pt-8 border-t">
          <h2 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-6">Customer Reviews</h2>
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
        </section>
      )}
    </div>
  );
}
