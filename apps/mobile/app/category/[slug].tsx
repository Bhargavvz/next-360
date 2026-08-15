import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { ArrowLeft, PackageSearch } from 'lucide-react-native';
import { useCategoryProducts } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useAuthStore } from '../../lib/auth';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { ProductCard, type ProductCardData } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useScreenInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useCategoryProducts(slug);

  const products: ProductCardData[] = useMemo(
    () => data?.pages.flatMap((p: any) => p.content) ?? [],
    [data]
  );

  const gridWidth = (width - Spacing[5] * 2 - Spacing[3.5]) / 2;

  // Slugs are the only label available until a product lands, so title-case it.
  const title = slug
    ? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Category';

  const handleAdd = useCallback(
    async (product: ProductCardData) => {
      if (!isAuthenticated) {
        router.push('/(auth)/login');
        throw new Error('auth');
      }
      try {
        await addItem({ productId: product.id, quantity: 1 });
      } catch (err: any) {
        Alert.alert('Could not add to cart', err.message);
        throw err;
      }
    },
    [addItem, isAuthenticated]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing[3],
          paddingHorizontal: Spacing[5],
          paddingVertical: Spacing[3],
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel="Go back"
          style={{
            width: 40,
            height: 40,
            borderRadius: Radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <ArrowLeft size={19} color={colors.text} />
        </Pressable>
        <Text variant="display" style={{ fontSize: 26, flex: 1 }} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: Spacing[5],
            gap: Spacing[3.5],
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} style={{ width: gridWidth }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: Spacing[3.5] }}
          contentContainerStyle={{
            padding: Spacing[5],
            gap: Spacing[5],
            paddingBottom: Spacing[16],
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
          onEndReachedThreshold={0.6}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          renderItem={({ item }) => (
            <ProductCard product={item} onAdd={handleAdd} style={{ width: gridWidth }} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<PackageSearch size={26} color={colors.primary} />}
              title="Nothing here yet"
              subtitle="No products are listed in this category at the moment."
              action={{ label: 'Browse everything', onPress: () => router.push('/(tabs)/discover') }}
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing[5] }} />
            ) : null
          }
        />
      )}
    </View>
  );
}
