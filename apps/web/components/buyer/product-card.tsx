import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Heart, ShieldCheck, Star } from 'lucide-react';

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

export function ProductCard({
  name, slug, imageUrl, price, mrp, rating, reviewCount = 0,
  isVerifiedOrganic, sellerName, inStock = true, productType,
}: ProductCardProps) {
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-muted/50 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl text-muted-foreground/30">🌿</div>
          )}

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isVerifiedOrganic && (
              <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </div>
            )}
            {discount > 0 && (
              <div className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-background hover:scale-110"
          >
            <Heart className="h-4 w-4" />
          </button>

          {!inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm font-semibold text-muted-foreground">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          {/* Product type badge */}
          {productType && (
            <Badge variant={productType === 'ORGANIC' ? 'organic' : productType === 'NATURAL' ? 'natural' : 'eco'} className="text-[10px]">
              {productType === 'ORGANIC' ? '🟢 Organic' : productType === 'NATURAL' ? '🟡 Natural' : '🔵 Eco-Friendly'}
            </Badge>
          )}

          <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {sellerName && (
            <p className="text-xs text-muted-foreground truncate">by {sellerName}</p>
          )}

          {/* Rating */}
          {rating && rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5 bg-primary/10 text-primary text-xs font-semibold px-1.5 py-0.5 rounded">
                <Star className="h-3 w-3 fill-current" /> {rating.toFixed(1)}
              </div>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-lg font-bold">₹{price.toLocaleString('en-IN')}</span>
            {mrp && mrp > price && (
              <span className="text-sm text-muted-foreground line-through">₹{mrp.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
