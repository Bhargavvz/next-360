import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { publicApi } from '../api';

export interface ProductFilters {
  q?: string;
  /** Category UUID — the API filters by id, not slug. */
  categoryId?: string;
  productType?: string;
  verifiedOnly?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
  size?: number;
}

const PAGE_SIZE = 20;

/**
 * Builds the search query string.
 *
 * Parameter names must match `ProductSearchRequest` exactly — Spring silently
 * drops anything it cannot bind, which is how `q`, `verifiedOrganic` and
 * `category` all ended up being ignored and returning the unfiltered catalogue.
 */
function buildSearchParams(filters: ProductFilters, page: number, size: number) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  params.set('sortBy', filters.sortBy ?? 'relevance');
  if (filters.q) params.set('query', filters.q);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.productType) params.set('productType', filters.productType);
  if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
  return params;
}

// ========================= Product Search (infinite) ========================= //
export function useProducts(filters: ProductFilters = {}) {
  const size = filters.size ?? PAGE_SIZE;

  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await publicApi.get(
        `/api/v1/search?${buildSearchParams(filters, pageParam as number, size)}`
      );
      return res.data.data;
    },
    getNextPageParam: (lastPage: any) => (lastPage?.last ? undefined : lastPage?.number + 1),
    initialPageParam: 0,
  });
}

// ========================= Single Product ========================= //
export function useProduct(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) throw new Error('No product identifier');
      const res = await publicApi.get(`/api/v1/products/${idOrSlug}`);
      return res.data.data;
    },
    enabled: !!idOrSlug,
    staleTime: 2 * 60 * 1000,
  });
}

// ========================= Categories ========================= //
export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  parentId?: string | null;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await publicApi.get('/api/v1/categories');
      return res.data.data as Category[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ========================= Product Reviews ========================= //
export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const res = await publicApi.get(`/api/v1/products/${productId}/reviews?size=10`);
      return res.data.data;
    },
    enabled: !!productId,
  });
}

// ========================= Category Products ========================= //
/**
 * Products in a category, addressed by slug.
 *
 * The route carries a slug but the search API filters on the category UUID, so
 * the id is resolved from the cached category list first.
 */
export function useCategoryProducts(slug: string | undefined) {
  const { data: categories } = useCategories();
  const categoryId = categories?.find((c) => c.slug === slug)?.id;

  return useInfiniteQuery({
    queryKey: ['category-products', categoryId],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await publicApi.get(
        `/api/v1/search?${buildSearchParams({ categoryId }, pageParam as number, PAGE_SIZE)}`
      );
      return res.data.data;
    },
    getNextPageParam: (lastPage: any) => (lastPage?.last ? undefined : lastPage?.number + 1),
    initialPageParam: 0,
    enabled: !!categoryId,
  });
}
