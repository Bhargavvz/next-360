import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCategoryProducts } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useWishlistStore } from '../../lib/store/wishlist';
import { ProductCard, Product } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';
import { ArrowLeft, Package } from 'lucide-react-native';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const addToCart = useCartStore((s) => s.addItem);
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useCategoryProducts(slug);

  const products = useMemo(
    () => data?.pages.flatMap((p: any) => p.content) ?? [],
    [data]
  );

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

  // Format category name from slug
  const categoryName = slug
    ? slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'Category';

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (index % 2 !== 0) return null;
    const right = products[index + 1];
    return (
      <View style={styles.row}>
        <ProductCard
          product={{ ...item, inStock: item.inStock }}
          isWishlisted={isWishlisted(item.id)}
          onWishlistToggle={(id) =>
            toggleWishlist({
              productId: id,
              slug: item.slug,
              name: item.name,
              imageUrl: item.imageUrl,
              price: item.price,
              mrp: item.mrp,
              productType: item.productType,
              sellerName: item.sellerName,
            })
          }
          onAddToCart={handleAddToCart}
        />
        {right ? (
          <ProductCard
            product={{ ...right, inStock: right.inStock }}
            isWishlisted={isWishlisted(right.id)}
            onWishlistToggle={(id) =>
              toggleWishlist({
                productId: id,
                slug: right.slug,
                name: right.name,
                imageUrl: right.imageUrl,
                price: right.price,
                mrp: right.mrp,
                productType: right.productType,
                sellerName: right.sellerName,
              })
            }
            onAddToCart={handleAddToCart}
          />
        ) : (
          <View style={{ width: '47%' }} />
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryName}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package size={48} color={Colors.gray400} />}
          title="No products found"
          subtitle={`We couldn't find any products in ${categoryName}`}
          action={{ label: 'Go Back', onPress: () => router.back() }}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    textAlign: 'center',
  },
  list: {
    padding: Spacing[4],
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing[4],
    gap: Spacing[4],
    justifyContent: 'space-between',
  },
  loadingMore: {
    paddingVertical: Spacing[6],
    alignItems: 'center',
  },
});
