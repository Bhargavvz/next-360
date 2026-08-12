'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { ProductCard } from '@/components/buyer/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, SlidersHorizontal, X, ShieldCheck,
  Sprout, Recycle, LayoutGrid, List, ArrowUpDown
} from 'lucide-react';
import { publicApi } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

const TYPE_FILTERS = [
  { value: '', label: 'All Types', icon: null },
  { value: 'ORGANIC', label: 'Organic', icon: ShieldCheck, color: 'text-emerald-600' },
  { value: 'NATURAL', label: 'Natural', icon: Sprout, color: 'text-amber-600' },
  { value: 'ECO_FRIENDLY', label: 'Eco-Friendly', icon: Recycle, color: 'text-blue-600' },
];

function FilterSideBar({
  categories, selectedCategory, setSelectedCategory,
  verifiedOnly, setVerifiedOnly, productType, setProductType,
  onClear, hasActiveFilters,
}: any) {
  const rootCats = categories.filter((c: any) => !c.parentId);

  return (
    <aside className="w-60 shrink-0 hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Filters</span>
          {hasActiveFilters && (
            <button onClick={onClear}
              className="text-xs text-primary hover:underline flex items-center gap-1">
              <X className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>

        {/* Verified organic toggle */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Certification</p>
          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm transition-all ${
              verifiedOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                : 'bg-card border-border hover:border-primary/40 text-foreground'
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${verifiedOnly ? 'text-emerald-600' : 'text-muted-foreground'}`} />
            NPOP Verified Organic
          </button>
        </div>

        {/* Product type */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Product Type</p>
          <div className="space-y-1">
            {TYPE_FILTERS.map(t => (
              <button
                key={t.value}
                onClick={() => setProductType(t.value)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  productType === t.value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted/60 text-foreground'
                }`}
              >
                {t.icon && <t.icon className={`h-4 w-4 ${t.color}`} />}
                {!t.icon && <span className="h-4 w-4" />}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        {rootCats.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</p>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-all text-left ${
                  !selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/60 text-foreground'
                }`}
              >
                All Categories
              </button>
              {rootCats.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left ${
                    selectedCategory === cat.slug
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('query') || searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('query') || searchParams.get('q') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verified') === 'true');
  const [productType, setProductType] = useState(searchParams.get('type') || '');
  const [sortBy, setSortBy] = useState('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    publicApi.get('/api/v1/categories')
      .then(r => setCategories(r.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (verifiedOnly) params.set('verifiedOrganic', 'true');
    if (productType) params.set('productType', productType);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('sortBy', sortBy);
    params.set('size', '60');

    publicApi.get(`/api/v1/search?${params.toString()}`)
      .then(res => {
        const data = res.data.data;
        setProducts(data?.content || []);
        setTotalCount(data?.totalElements || data?.content?.length || 0);
      })
      .catch(() => { setProducts([]); setTotalCount(0); })
      .finally(() => setLoading(false));
  }, [query, verifiedOnly, sortBy, productType, selectedCategory]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
  }, [inputValue]);

  const clearAll = () => {
    setVerifiedOnly(false);
    setProductType('');
    setSelectedCategory('');
    setQuery('');
    setInputValue('');
  };

  const hasActiveFilters = verifiedOnly || !!productType || !!selectedCategory || !!query;

  const activePills = [
    ...(verifiedOnly ? [{ label: 'Verified Organic', onRemove: () => setVerifiedOnly(false) }] : []),
    ...(productType ? [{ label: TYPE_FILTERS.find(t => t.value === productType)?.label || productType, onRemove: () => setProductType('') }] : []),
    ...(selectedCategory ? [{ label: categories.find(c => c.slug === selectedCategory)?.name || selectedCategory, onRemove: () => setSelectedCategory('') }] : []),
    ...(query ? [{ label: `"${query}"`, onRemove: () => { setQuery(''); setInputValue(''); } }] : []),
  ];

  const pageTitle = verifiedOnly ? 'Verified Organic Products'
    : productType ? TYPE_FILTERS.find(t => t.value === productType)?.label + ' Products'
    : selectedCategory ? (categories.find(c => c.slug === selectedCategory)?.name || 'Products')
    : query ? `Results for "${query}"`
    : 'All Products';

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky top bar ─────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="container">
          <div className="flex items-center gap-3 py-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search organic products..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setQuery(inputValue)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-colors"
              />
              {inputValue && (
                <button type="button" onClick={() => { setInputValue(''); setQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </form>

            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-10 pl-8 pr-3 rounded-lg border bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`lg:hidden flex items-center gap-1.5 h-10 px-3 rounded-lg border text-sm transition-colors ${showMobileFilters ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted/50'}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary lg:hidden" />}
            </button>

            {/* View toggle */}
            <div className="hidden sm:flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')}
                className={`h-10 w-10 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}>
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`h-10 w-10 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile filters drawer ───────────────────────────── */}
      {showMobileFilters && (
        <div className="lg:hidden bg-muted/30 border-b">
          <div className="container py-4 space-y-4">
            {/* Type pills */}
            <div className="flex flex-wrap gap-2">
              <p className="text-xs font-semibold text-muted-foreground w-full uppercase tracking-wider">Type</p>
              {TYPE_FILTERS.map(t => (
                <button key={t.value} onClick={() => setProductType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    productType === t.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border'
                  }`}>
                  {t.icon && <t.icon className="h-3 w-3" />}
                  {t.label}
                </button>
              ))}
            </div>
            {/* Verified toggle */}
            <button onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                verifiedOnly ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium' : 'bg-background border-border'
              }`}>
              <ShieldCheck className="h-4 w-4" /> NPOP Verified Organic
            </button>
            {/* Categories */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!selectedCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border'}`}>
                  All
                </button>
                {categories.filter((c: any) => !c.parentId).map((cat: any) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedCategory === cat.slug ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Sort mobile */}
            <div className="sm:hidden">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sort</p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="container py-6 md:py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSideBar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            verifiedOnly={verifiedOnly}
            setVerifiedOnly={setVerifiedOnly}
            productType={productType}
            setProductType={setProductType}
            onClear={clearAll}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Page title + count */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-xl md:text-2xl font-bold font-[family-name:var(--font-outfit)]">{pageTitle}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {loading ? 'Searching...' : totalCount > 0 ? `${totalCount} product${totalCount !== 1 ? 's' : ''} found` : 'No products found'}
                </p>
              </div>
            </div>

            {/* Active filter pills */}
            {activePills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activePills.map(pill => (
                  <span key={pill.label}
                    className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                    {pill.label}
                    <button onClick={pill.onRemove} className="hover:text-primary/60 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {activePills.length > 1 && (
                  <button onClick={clearAll}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-full hover:bg-muted/50 transition-colors">
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Products */}
            {loading ? (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5'
                : 'space-y-3'}>
                {Array.from({ length: 12 }).map((_, i) =>
                  viewMode === 'grid' ? (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square rounded-2xl" />
                      <Skeleton className="h-3 w-1/3 rounded" />
                      <Skeleton className="h-4 w-4/5 rounded" />
                      <Skeleton className="h-4 w-1/3 rounded" />
                    </div>
                  ) : (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  )
                )}
              </div>
            ) : products.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map((p: any) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      imageUrl={p.imageUrl || p.images?.[0]?.url}
                      price={p.price}
                      mrp={p.mrp}
                      rating={p.rating}
                      reviewCount={p.reviewCount}
                      isVerifiedOrganic={p.isVerifiedOrganic || p.verifiedOrganic}
                      sellerName={p.sellerName}
                      inStock={p.inStock ?? (p.stock > 0)}
                      productType={p.productType}
                    />
                  ))}
                </div>
              ) : (
                /* List view */
                <div className="space-y-3">
                  {products.map((p: any) => (
                    <ProductListRow key={p.id} product={p} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-24 rounded-2xl border bg-card">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No products found</h3>
                <p className="text-muted-foreground text-sm mb-5">
                  {hasActiveFilters ? 'Try removing some filters or searching with different keywords.' : 'Be the first to list here — check back soon.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearAll}
                    className="text-sm text-primary hover:underline">Clear all filters</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── List-view row ─────────────────────────────────────────── */
function ProductListRow({ product }: { product: any }) {
  const p = product;
  const discount = p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

  return (
    <a href={`/products/${p.slug}`}
      className="group flex gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all">
      {/* Image */}
      <div className="h-24 w-24 shrink-0 rounded-xl bg-muted overflow-hidden">
        {p.imageUrl || p.images?.[0]?.url
          ? <img src={p.imageUrl || p.images[0].url} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="h-full w-full flex items-center justify-center text-muted-foreground/20">
              <Search className="h-8 w-8" />
            </div>
        }
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {(p.verifiedOrganic || p.isVerifiedOrganic) && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-1.5">
                <ShieldCheck className="h-3 w-3" /> NPOP VERIFIED
              </span>
            )}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h3>
            {p.sellerName && <p className="text-xs text-muted-foreground mt-0.5">by {p.sellerName}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold">₹{p.price?.toLocaleString('en-IN')}</p>
            {p.mrp && p.mrp > p.price && (
              <p className="text-xs text-muted-foreground line-through">₹{p.mrp?.toLocaleString('en-IN')}</p>
            )}
            {discount > 0 && (
              <span className="text-xs font-semibold text-emerald-600">{discount}% off</span>
            )}
          </div>
        </div>
        {p.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{p.description}</p>
        )}
      </div>
    </a>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container py-10">
        <div className="flex gap-8">
          <div className="w-60 hidden lg:block space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
