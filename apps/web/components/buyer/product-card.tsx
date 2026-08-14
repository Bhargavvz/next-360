'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Plus, Check, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Price } from '@/components/ui/price';
import { Rating } from '@/components/ui/rating';
import { Badge } from '@/components/ui/badge';
import { TypeMark, VerifiedSeal } from '@/components/brand/trust-mark';

export interface ProductCardProps {
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
  stock?: number;
  productType?: string;
  /**
   * `editorial` — tall, generous, for the home page and featured rails.
   * `compact`   — dense, for search results and category grids.
   */
  variant?: 'editorial' | 'compact';
  priority?: boolean;
  className?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  imageUrl,
  price,
  mrp,
  rating,
  reviewCount = 0,
  isVerifiedOrganic,
  sellerName,
  inStock = true,
  stock,
  productType,
  variant = 'compact',
  className,
}: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const editorial = variant === 'editorial';
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const lowStock = inStock && typeof stock === 'number' && stock > 0 && stock <= 5;

  const requireAuth = () => {
    toast.error('Sign in to continue', {
      action: { label: 'Sign in', onClick: () => (window.location.href = '/auth') },
    });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return requireAuth();

    const next = !wishlisted;
    setWishlisted(next); // optimistic — reverted below if the call fails
    try {
      if (next) await api.post('/api/v1/wishlist', { productId: id });
      else await api.delete(`/api/v1/wishlist/${id}`);
    } catch (err) {
      setWishlisted(!next);
      toast.error(apiErrorMessage(err, 'Could not update your wishlist'));
    }
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return requireAuth();
    if (!inStock || adding) return;

    setAdding(true);
    try {
      await api.post('/api/v1/cart', { productId: id, quantity: 1 });
      setAdded(true);
      window.dispatchEvent(new CustomEvent('next360:cart-changed'));
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not add to cart'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className={cn('group relative', className)}>
      <Link href={`/products/${slug || id}`} className="block focus:outline-none">
        {/* Image */}
        <div
          className={cn(
            'relative overflow-hidden rounded-xl bg-surface-sunken',
            editorial ? 'aspect-[4/5]' : 'aspect-square'
          )}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className={cn(
                'h-full w-full object-cover transition-transform duration-500 ease-natural',
                'group-hover:scale-[1.04]',
                !inStock && 'opacity-50 saturate-50'
              )}
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <Leaf className="h-10 w-10 text-border-strong" strokeWidth={1.25} />
            </div>
          )}

          {/* Top-left: classification + proof. Two marks max, never more.
              Labels are always shown — a bare icon in a pill is unreadable at
              this size and reads as a stray dot. */}
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {isVerifiedOrganic ? (
              <VerifiedSeal size="sm" />
            ) : (
              <TypeMark type={productType} size="sm" />
            )}
            {discount > 0 && (
              <Badge variant="solid" size="sm" className="tabular">
                {discount}% off
              </Badge>
            )}
          </div>

          {/* Wishlist — appears on hover on desktop, always present on touch. */}
          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlisted}
            className={cn(
              'absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full',
              'frost border border-border/50 shadow-xs transition-all duration-200 ease-natural',
              'hover:scale-110 active:scale-95',
              'md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100',
              wishlisted && 'md:opacity-100'
            )}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                wishlisted ? 'fill-destructive text-destructive' : 'text-foreground'
              )}
            />
          </button>

          {!inStock && (
            <div className="absolute inset-x-0 bottom-0 bg-foreground/85 py-1.5 text-center text-xs font-medium text-background">
              Out of stock
            </div>
          )}

          {lowStock && (
            <div className="absolute inset-x-0 bottom-0 bg-warning/90 py-1.5 pr-11 text-center text-xs font-medium text-background">
              Only {stock} left
            </div>
          )}

          {/* Add to cart sits on the image corner, the q-commerce convention.
              Placing it below would collide with the price line. It is inside
              the <Link> visually but handled as a button — the click handler
              stops propagation so it never navigates. */}
          <button
            onClick={handleAdd}
            disabled={!inStock || adding}
            aria-label={`Add ${name} to cart`}
            className={cn(
              'absolute bottom-2.5 right-2.5 grid place-items-center rounded-full transition-all duration-200 ease-natural',
              'h-9 w-9 shadow-md active:scale-90 disabled:pointer-events-none disabled:opacity-0',
              added
                ? 'bg-success text-background'
                : 'bg-surface text-foreground hover:bg-primary hover:text-primary-foreground'
            )}
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>

        {/* Copy */}
        <div className={cn('space-y-1', editorial ? 'mt-4' : 'mt-3')}>
          {sellerName && (
            <p className="truncate text-2xs uppercase tracking-wider text-subtle-foreground">
              {sellerName}
            </p>
          )}

          <h3
            className={cn(
              'text-pretty font-medium text-foreground transition-colors group-hover:text-primary',
              editorial ? 'font-display text-lg leading-snug' : 'line-clamp-2 text-sm leading-snug'
            )}
          >
            {name}
          </h3>

          {rating != null && rating > 0 && (
            <Rating value={rating} count={reviewCount} size="sm" />
          )}

          <div className="pt-0.5">
            <Price value={price} mrp={mrp} size={editorial ? 'md' : 'sm'} />
          </div>
        </div>
      </Link>
    </article>
  );
}
