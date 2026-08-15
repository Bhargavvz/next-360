'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, SlidersHorizontal, X, ShieldCheck, Check, ChevronDown, PackageSearch,
} from 'lucide-react';
import { publicApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/buyer/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { PRODUCT_TYPES, type ProductType } from '@/components/brand/trust-mark';

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
];

const TYPE_KEYS = Object.keys(PRODUCT_TYPES) as ProductType[];

interface Filters {
  query: string;
  verifiedOnly: boolean;
  productType: string;
  category: string;
  sortBy: string;
}

/**
 * Filter controls. Rendered twice — as a sticky desktop rail and inside the
 * mobile sheet — from one definition, so the two can never drift apart.
 */
function FilterPanel({
  categories,
  filters,
  set,
  onClear,
  hasActive,
}: {
  categories: any[];
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  onClear: () => void;
  hasActive: boolean;
}) {
  const roots = categories.filter((c: any) => !c.parentId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Filters</h2>
        {hasActive && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs text-primary transition-colors hover:text-primary-hover"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Certification — the headline filter, so it gets its own treatment. */}
      <div>
        <p className="mb-3 text-2xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
          Certification
        </p>
        <button
          onClick={() => set({ verifiedOnly: !filters.verifiedOnly })}
          aria-pressed={filters.verifiedOnly}
          className={cn(
            'flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ease-natural',
            filters.verifiedOnly
              ? 'border-seal-border bg-seal-muted'
              : 'border-border bg-surface hover:border-border-strong'
          )}
        >
          <span
            className={cn(
              'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors',
              filters.verifiedOnly
                ? 'border-seal bg-seal text-seal-foreground'
                : 'border-border-strong'
            )}
          >
            {filters.verifiedOnly && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium',
                filters.verifiedOnly ? 'text-seal' : 'text-foreground'
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              NPOP verified only
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
              Certificate on file, checked by our team
            </span>
          </span>
        </button>
      </div>

      <div>
        <p className="mb-3 text-2xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
          Type
        </p>
        <div className="space-y-0.5">
          <FilterRow
            active={!filters.productType}
            onClick={() => set({ productType: '' })}
            label="All types"
          />
          {TYPE_KEYS.map((key) => {
            const type = PRODUCT_TYPES[key];
            return (
              <FilterRow
                key={key}
                active={filters.productType === key}
                onClick={() => set({ productType: key })}
                label={type.label}
                icon={<type.Icon className="h-4 w-4" />}
              />
            );
          })}
        </div>
      </div>

      {roots.length > 0 && (
        <div>
          <p className="mb-3 text-2xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
            Category
          </p>
          <div className="space-y-0.5">
            <FilterRow
              active={!filters.category}
              onClick={() => set({ category: '' })}
              label="All categories"
            />
            {roots.map((cat: any) => (
              <FilterRow
                key={cat.id}
                active={filters.category === cat.id}
                onClick={() => set({ category: cat.id })}
                label={cat.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
        active
          ? 'bg-primary-muted font-medium text-primary'
          : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
      )}
    >
      {icon ?? <span className="h-4 w-4" />}
      <span className="truncate">{label}</span>
    </button>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    query: searchParams.get('query') ?? searchParams.get('q') ?? '',
    verifiedOnly: searchParams.get('verified') === 'true',
    productType: searchParams.get('productType') ?? searchParams.get('type') ?? '',
    category: searchParams.get('categoryId') ?? searchParams.get('category') ?? '',
    sortBy: searchParams.get('sortBy') ?? 'relevance',
  });

  const [input, setInput] = useState(filters.query);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const set = useCallback(
    (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch })),
    []
  );

  useEffect(() => {
    publicApi
      .get('/api/v1/categories')
      .then((r) => setCategories(r.data.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.query) params.set('query', filters.query);
    if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
    if (filters.productType) params.set('productType', filters.productType);
    if (filters.category) params.set('categoryId', filters.category);
    params.set('sortBy', filters.sortBy);
    params.set('size', '60');

    publicApi
      .get(`/api/v1/search?${params}`)
      .then((res) => {
        const data = res.data.data;
        setProducts(data?.content ?? []);
        setTotal(data?.totalElements ?? data?.content?.length ?? 0);
      })
      .catch(() => {
        setProducts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  // Body scroll lock while the mobile filter sheet is open.
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const clearAll = () =>
    setFilters({ query: '', verifiedOnly: false, productType: '', category: '', sortBy: 'relevance' });

  const hasActive =
    filters.verifiedOnly || !!filters.productType || !!filters.category || !!filters.query;

  const pills = useMemo(
    () => [
      ...(filters.verifiedOnly
        ? [{ label: 'NPOP verified', clear: () => set({ verifiedOnly: false }) }]
        : []),
      ...(filters.productType
        ? [
            {
              label: PRODUCT_TYPES[filters.productType as ProductType]?.label ?? filters.productType,
              clear: () => set({ productType: '' }),
            },
          ]
        : []),
      ...(filters.category
        ? [
            {
              label: categories.find((c) => c.id === filters.category)?.name ?? filters.category,
              clear: () => set({ category: '' }),
            },
          ]
        : []),
      ...(filters.query
        ? [
            {
              label: `“${filters.query}”`,
              clear: () => {
                set({ query: '' });
                setInput('');
              },
            },
          ]
        : []),
    ],
    [filters, categories, set]
  );

  const heading = filters.verifiedOnly
    ? 'Verified organic'
    : filters.productType
      ? PRODUCT_TYPES[filters.productType as ProductType]?.label ?? 'Products'
      : filters.category
        ? categories.find((c) => c.id === filters.category)?.name ?? 'Products'
        : filters.query
          ? `Results for “${filters.query}”`
          : 'The catalogue';

  const activeSort = SORTS.find((s) => s.value === filters.sortBy)?.label ?? 'Relevance';

  return (
    <div className="container py-8 md:py-12">
      {/* Page head */}
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
          {heading}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {loading ? 'Searching…' : `${total} ${total === 1 ? 'product' : 'products'}`}
          {filters.verifiedOnly && ' · every one with a certificate on file'}
        </p>
      </header>

      <div className="flex gap-10">
        {/* Desktop rail */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24">
            <FilterPanel
              categories={categories}
              filters={filters}
              set={set}
              onClear={clearAll}
              hasActive={hasActive}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                set({ query: input });
              }}
              className="relative min-w-0 flex-1"
            >
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search within results"
                className="h-11 w-full rounded-lg border border-input bg-surface pl-10 pr-4 text-base text-foreground transition-colors placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12"
              />
            </form>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                aria-expanded={sortOpen}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm text-foreground transition-colors hover:border-border-strong"
              >
                <span className="hidden text-subtle-foreground sm:inline">Sort:</span>
                {activeSort}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-subtle-foreground transition-transform',
                    sortOpen && 'rotate-180'
                  )}
                />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-12 z-30 w-52 animate-scale-in rounded-xl border border-border bg-popover p-1.5 shadow-lg">
                    {SORTS.map((sort) => (
                      <button
                        key={sort.value}
                        onClick={() => {
                          set({ sortBy: sort.value });
                          setSortOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-surface-hover',
                          filters.sortBy === sort.value ? 'text-primary' : 'text-foreground'
                        )}
                      >
                        {sort.label}
                        {filters.sortBy === sort.value && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Button
              variant="secondary"
              className="h-11 lg:hidden"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {pills.length > 0 && (
                <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-2xs text-primary-foreground">
                  {pills.length}
                </span>
              )}
            </Button>
          </div>

          {/* Active pills */}
          {pills.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {pills.map((pill) => (
                <button
                  key={pill.label}
                  onClick={pill.clear}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs text-foreground transition-colors hover:border-destructive hover:text-destructive"
                >
                  {pill.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                onClick={clearAll}
                className="px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch />}
              title="Nothing matched those filters"
              description="Try removing a filter, or search the full catalogue for something broader."
              action={
                hasActive ? (
                  <Button onClick={clearAll}>Clear all filters</Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  name={p.name}
                  imageUrl={p.primaryImageUrl}
                  price={p.price}
                  mrp={p.mrp}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                  isVerifiedOrganic={p.isVerifiedOrganic}
                  sellerName={p.sellerName}
                  productType={p.productType}
                  inStock={p.stock == null || p.stock > 0}
                  stock={p.stock}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal>
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-slide-up overflow-y-auto rounded-t-2xl border-t border-border bg-surface">
            {/* Drag handle — signals the sheet is dismissible. */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 pb-3 pt-3">
              <span className="mx-auto h-1 w-10 rounded-full bg-border-strong" aria-hidden />
              <button
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="absolute right-4 top-3 grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-surface-hover"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 pb-8">
              <FilterPanel
                categories={categories}
                filters={filters}
                set={set}
                onClear={clearAll}
                hasActive={hasActive}
              />
              <Button block size="lg" className="mt-8" onClick={() => setSheetOpen(false)}>
                Show {total} {total === 1 ? 'product' : 'products'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-12">
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
