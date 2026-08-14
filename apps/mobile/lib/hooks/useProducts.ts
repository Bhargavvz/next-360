import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { publicApi, api } from '../api';

export interface ProductFilters {
  q?: string;
  category?: string;
  productType?: string;
  verifiedOrganic?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating';
  size?: number;
}

const PAGE_SIZE = 20;

// ========================= Product Search (infinite) ========================= //
export function useProducts(filters: ProductFilters = {}) {
  const { q, category, productType, verifiedOrganic, sortBy = 'relevance', size = PAGE_SIZE } = filters;

  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.set('page', String(pageParam));
      params.set('size', String(size));
      params.set('sortBy', sortBy);
      // The API binds this to ProductSearchRequest.query — sending `q` bound
      // nothing, so every search silently returned the unfiltered catalogue.
      if (q) params.set('query', q);
      if (category) params.set('category', category);
      if (productType) params.set('productType', productType);
      if (verifiedOrganic) params.set('verifiedOrganic', 'true');

      const res = await publicApi.get(`/api/v1/search?${params.toString()}`);
      return res.data.data;
    },
    getNextPageParam: (lastPage: any) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    initialPageParam: 0,
  });
}

// ========================= Single Product ========================= //
export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug');
      const res = await publicApi.get(`/api/v1/products/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

// ========================= Categories ========================= //
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await publicApi.get('/api/v1/categories');
      return res.data.data as { id: string; name: string; slug: string; imageUrl?: string }[];
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
export function useCategoryProducts(slug: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['category-products', slug],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await publicApi.get(`/api/v1/search?category=${slug}&page=${pageParam}&size=${PAGE_SIZE}`);
      return res.data.data;
    },
    getNextPageParam: (lastPage: any) => (lastPage.last ? undefined : lastPage.number + 1),
    initialPageParam: 0,
    enabled: !!slug,
  });
}
