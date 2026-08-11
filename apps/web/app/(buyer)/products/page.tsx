'use client';

import { useState, useEffect, Suspense } from 'react';
import { ProductCard } from '@/components/buyer/product-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, X, ShieldCheck } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

function ProductsContent() {

  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (verifiedOnly) params.set('verifiedOrganic', 'true');
    params.set('sortBy', sortBy);

    publicApi.get(`/api/v1/search?${params.toString()}`)
      .then(res => setProducts(res.data.data?.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [query, verifiedOnly, sortBy]);

  return (
    <div className="container py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)]">
            {verifiedOnly ? 'Verified Organic Products' : 'All Products'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {loading ? 'Loading...' : `${products.length} products found`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border bg-muted/30 animate-in slide-in-from-top-2">
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${verifiedOnly ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/50'}`}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Verified Organic
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          {(verifiedOnly || query) && (
            <button onClick={() => { setVerifiedOnly(false); setQuery(''); }} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Active filters */}
      {(verifiedOnly || query) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {verifiedOnly && (
            <Badge variant="organic" className="gap-1">
              <ShieldCheck className="h-3 w-3" /> Verified Organic
              <button onClick={() => setVerifiedOnly(false)}><X className="h-3 w-3 ml-1" /></button>
            </Badge>
          )}
          {query && (
            <Badge variant="outline" className="gap-1">
              &ldquo;{query}&rdquo;
              <button onClick={() => setQuery('')}><X className="h-3 w-3 ml-1" /></button>
            </Badge>
          )}
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              imageUrl={p.imageUrl}
              price={p.price}
              mrp={p.mrp}
              rating={p.rating}
              reviewCount={p.reviewCount}
              isVerifiedOrganic={p.isVerifiedOrganic || p.verifiedOrganic}
              sellerName={p.sellerName}
              inStock={p.inStock}
              productType={p.productType}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌿</div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container py-10"><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="space-y-3"><div className="aspect-square rounded-2xl bg-muted animate-pulse" /><div className="h-4 w-3/4 bg-muted rounded animate-pulse" /></div>)}</div></div>}>
      <ProductsContent />
    </Suspense>
  );
}
