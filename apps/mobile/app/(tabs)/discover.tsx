import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useWishlistStore } from '../../lib/store/wishlist';
import { ProductCard, Product } from '../../components/ui/ProductCard';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { Colors, Spacing, Typography, Radius, Shadow } from '../../lib/theme';

const FILTER_CHIPS = [
  { label: 'All', value: '' },
  { label: 'Organic', value: 'ORGANIC' },
  { label: 'Natural', value: 'NATURAL' },
  { label: 'Eco', value: 'ECO_FRIENDLY' },
];

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState('');
  const [sortBy, setSortBy] = useState<any>('relevance');
  const [showSort, setShowSort] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore();

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useProducts({
    q: search || undefined,
    productType: productType || undefined,
    sortBy,
  });

  const products = useMemo(
    () => data?.pages.flatMap((p: any) => p.content) ?? [],
    [data]
  );

  const handleSearch = () => setSearch(query);

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      mrp: product.mrp,
      sellerName: product.sellerName,
      stock: 99,
    });
  };

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (index % 2 !== 0) return null; // render pairs
      const right = products[index + 1];
      return (
        <View style={styles.row}>
          <ProductCard
            product={{ ...item, inStock: item.inStock }}
            isWishlisted={isWishlisted(item.id)}
            onWishlistToggle={(id) => toggleWishlist({ productId: id, slug: item.slug, name: item.name, imageUrl: item.imageUrl, price: item.price, mrp: item.mrp, productType: item.productType, sellerName: item.sellerName })}
            onAddToCart={handleAddToCart}
          />
          {right && (
            <ProductCard
              product={{ ...right, inStock: right.inStock }}
              isWishlisted={isWishlisted(right.id)}
              onWishlistToggle={(id) => toggleWishlist({ productId: id, slug: right.slug, name: right.name, imageUrl: right.imageUrl, price: right.price, mrp: right.mrp, productType: right.productType, sellerName: right.sellerName })}
              onAddToCart={handleAddToCart}
            />
          )}
        </View>
      );
    },
    [products, isWishlisted]
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search organic products..."
              placeholderTextColor={Colors.gray400}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setSearch(''); }}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
            <Text style={styles.sortIcon}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <View style={styles.chips}>
          {FILTER_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.value}
              style={[styles.chip, productType === chip.value && styles.chipActive]}
              onPress={() => setProductType(chip.value)}
            >
              <Text style={[styles.chipText, productType === chip.value && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Result count */}
        {!isLoading && (
          <Text style={styles.resultCount}>{products.length} products found</Text>
        )}
      </View>

      {/* Product grid */}
      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="🌿"
          title="No products found"
          subtitle="Try adjusting your search or filters"
          action={{ label: 'Clear filters', onPress: () => { setSearch(''); setQuery(''); setProductType(''); } }}
        />
      ) : (
        <FlatList
          data={products.filter((_: any, i: number) => i % 2 === 0)}
          keyExtractor={(_: any, i: number) => String(i)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 16 }} />
            ) : null
          }
        />
      )}

      {/* Sort Bottom Sheet */}
      <BottomSheet visible={showSort} onClose={() => setShowSort(false)} title="Sort by">
        <View style={styles.sortOptions}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.sortOption, sortBy === opt.value && styles.sortOptionActive]}
              onPress={() => { setSortBy(opt.value as any); setShowSort(false); }}
            >
              <Text style={[styles.sortOptionText, sortBy === opt.value && styles.sortOptionTextActive]}>
                {opt.label}
              </Text>
              {sortBy === opt.value && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  headerTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.gray900,
    paddingTop: Spacing[3],
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: Colors.gray100,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    height: 46,
  },
  searchIcon: { fontSize: 15, color: Colors.gray400 },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.gray900,
  },
  clearIcon: { fontSize: 13, color: Colors.gray400 },
  sortBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.xl,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIcon: { fontSize: 18, color: Colors.gray600 },
  chips: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  chip: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    fontWeight: Typography.medium,
  },
  chipTextActive: { color: Colors.white, fontWeight: Typography.semibold },
  resultCount: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  list: {
    padding: Spacing[4],
    gap: Spacing[3],
  },
  row: {
    flexDirection: 'row',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    padding: Spacing[4],
  },
  sortOptions: {
    gap: Spacing[1],
    paddingBottom: Spacing[4],
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortOptionActive: {},
  sortOptionText: {
    fontSize: Typography.base,
    color: Colors.gray700,
  },
  sortOptionTextActive: {
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  checkMark: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});
