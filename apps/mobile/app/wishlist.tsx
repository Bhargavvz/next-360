import React, { useCallback } from 'react';
import { View, FlatList, Pressable, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../lib/useScreenInsets';
import { Heart, X } from 'lucide-react-native';
import { useWishlistStore } from '../lib/store/wishlist';
import { useCartStore } from '../lib/store/cart';
import { useAuthStore } from '../lib/auth';
import { Radius, Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { ProductCard, type ProductCardData } from '../components/ui/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ScreenHeader } from '../components/ui/ScreenHeader';

export default function WishlistScreen() {
  const insets = useScreenInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { items, remove } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const { isAuthenticated } = useAuthStore();

  const gridWidth = (width - Spacing[5] * 2 - Spacing[3.5]) / 2;

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
      <ScreenHeader
        title="Wishlist"
        subtitle={items.length ? `${items.length} saved` : undefined}
        variant="close"
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing[3.5] }}
        contentContainerStyle={{
          padding: Spacing[5],
          gap: Spacing[5],
          paddingBottom: Spacing[12],
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width: gridWidth }}>
            <ProductCard
              product={{
                id: item.productId,
                slug: item.slug,
                name: item.name,
                primaryImageUrl: item.imageUrl,
                price: item.price,
                mrp: item.mrp,
                productType: item.productType,
                sellerName: item.sellerName,
              }}
              onAdd={handleAdd}
            />

            {/* Remove sits on the card's top-right, where the wishlist heart
                would be on a normal card — the same spot means the same idea. */}
            <Pressable
              onPress={() => remove(item.productId)}
              hitSlop={8}
              accessibilityLabel={`Remove ${item.name} from wishlist`}
              style={{
                position: 'absolute',
                top: Spacing[2],
                right: Spacing[2],
                width: 28,
                height: 28,
                borderRadius: Radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
              }}
            >
              <X size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Heart size={26} color={colors.primary} />}
            title="Nothing saved yet"
            subtitle="Tap the heart on any product to keep it here for later."
            action={{ label: 'Browse products', onPress: () => router.push('/(tabs)/discover') }}
          />
        }
      />
    </View>
  );
}
