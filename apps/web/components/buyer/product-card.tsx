'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShieldCheck, Star, Heart, Sprout, Recycle, Leaf, ShoppingCart } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  price: number;
  mrp?: number | null;
  rating?: number | null;
  reviewCount?: number;
  isVerifiedOrganic?: boolean;
  sellerName?: string;
  inStock?: boolean;
  productType?: string;
}

const TYPE_CONFIG: Record<string, { icon: any; label: string; bg: string; text: string; border: string }> = {
  ORGANIC: {
    icon: ShieldCheck,
    label: 'Organic',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  NATURAL: {
    icon: Sprout,
    label: 'Natural',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  ECO_FRIENDLY: {
    icon: Recycle,
    label: 'Eco-Friendly',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
};

export function ProductCard({
  id, name, slug, imageUrl, price, mrp, rating, reviewCount = 0,
  isVerifiedOrganic, sellerName, inStock = true, productType,
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const typeCfg = productType ? TYPE_CONFIG[productType] : null;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setWishlisted(w => !w);
    try {
      if (wishlisted) await api.delete(`/api/v1/wishlist/${id}`);
      else await api.post('/api/v1/wishlist', { productId: id });
    } catch { setWishlisted(w => !w); }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !inStock || addingToCart) return;
    setAddingToCart(true);
    try {
      await api.post('/api/v1/cart', { productId: id, quantity: 1 });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch { /* silent */ }
    finally { setAddingToCart(false); }
  };

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:border-primary/20">

        {/* ── Image area ─────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-muted/60 to-muted">
          <div className="aspect-[4/3]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Leaf className="h-14 w-14 text-muted-foreground/15" />
              </div>
            )}
          </div>

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isVerifiedOrganic && (
              <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                <ShieldCheck className="h-2.5 w-2.5" /> VERIFIED
              </span>
            )}
            {discount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist button */}
          {isAuthenticated && (
            <button
              onClick={handleWishlist}
              className={`absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full shadow-md backdrop-blur-sm border transition-all
                opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                ${wishlisted
                  ? 'bg-rose-500 border-rose-500 text-white opacity-100 translate-y-0'
                  : 'bg-background/90 border-white/60 text-muted-foreground hover:text-rose-500'
                }`}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground bg-background/90 px-3 py-1 rounded-full border">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Add — slides up on hover */}
          {inStock && isAuthenticated && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors
                  ${addedToCart
                    ? 'bg-emerald-500 text-white'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}
              >
                {addedToCart ? (
                  <><ShieldCheck className="h-3.5 w-3.5" /> Added to Cart</>
                ) : addingToCart ? (
                  'Adding...'
                ) : (
                  <><ShoppingCart className="h-3.5 w-3.5" /> Quick Add</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Content area ───────────── */}
        <div className="p-3.5 space-y-2">
          {/* Type badge */}
          {typeCfg && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
              <typeCfg.icon className="h-2.5 w-2.5" />
              {typeCfg.label}
            </span>
          )}

          {/* Name */}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {name}
          </h3>

          {/* Seller */}
          {sellerName && (
            <p className="text-[11px] text-muted-foreground truncate">
              by {sellerName}
            </p>
          )}

          {/* Rating */}
          {rating && rating > 0 ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    className={`h-2.5 w-2.5 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {rating.toFixed(1)} {reviewCount > 0 && `(${reviewCount})`}
              </span>
            </div>
          ) : null}

          {/* Price row */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold">₹{price.toLocaleString('en-IN')}</span>
              {mrp && mrp > price && (
                <span className="text-xs text-muted-foreground line-through">₹{mrp.toLocaleString('en-IN')}</span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-bold text-emerald-600">
                {discount}% off
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
