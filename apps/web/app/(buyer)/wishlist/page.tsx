'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ProductCard } from '@/components/buyer/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth'); return; }
    api.get('/api/v1/wishlist?size=50')
      .then(res => setItems(res.data.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold font-display mb-8">
        <Heart className="inline h-6 w-6 text-primary mr-2" />
        My Wishlist {items.length > 0 && <span className="text-muted-foreground font-normal text-lg">({items.length})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💚</div>
          <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground">Browse products and tap the heart icon to save them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {items.map((item: any) => (
            <ProductCard
              key={item.id}
              id={item.productId}
              name={item.productName}
              slug={item.productSlug || item.productId}
              imageUrl={item.productImage}
              price={item.price || 0}
              mrp={item.mrp}
              rating={item.rating}
              reviewCount={item.reviewCount}
              isVerifiedOrganic={item.isVerifiedOrganic}
              sellerName={item.sellerName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
