import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWishlistStore } from '../lib/store/wishlist';
import { useCartStore } from '../lib/store/cart';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Colors, Spacing, Typography, Radius, Shadow } from '../lib/theme';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const { items, remove } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price,
      mrp: item.mrp,
      sellerName: item.sellerName,
      stock: 99,
    });
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`, [
      { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      { text: 'OK', style: 'cancel' },
    ]);
  };

  const handleRemove = (productId: string, name: string) => {
    Alert.alert('Remove from Wishlist', `Remove ${name} from your wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove(productId) },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.headerCount}>{items.length}</Text>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon="♡"
          title="Your wishlist is empty"
          subtitle="Save products you love to come back to them later"
          action={{ label: 'Discover Products', onPress: () => router.push('/(tabs)/discover') }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.productId}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Remove button */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.productId, item.name)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>

              {/* Image */}
              <TouchableOpacity
                style={styles.imageContainer}
                onPress={() => router.push(`/product/${item.slug}`)}
                activeOpacity={0.85}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]}>
                    <Text style={styles.imagePlaceholderText}>📦</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Info */}
              <View style={styles.info}>
                {item.productType && (
                  <Badge
                    variant={item.productType === 'ORGANIC' ? 'organic' : item.productType === 'NATURAL' ? 'natural' : 'eco'}
                    size="sm"
                  >
                    {item.productType === 'ORGANIC' ? 'Organic' : item.productType === 'NATURAL' ? 'Natural' : 'Eco'}
                  </Badge>
                )}
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price.toLocaleString('en-IN')}</Text>
                  {item.mrp && item.mrp > item.price && (
                    <Text style={styles.mrp}>₹{item.mrp.toLocaleString('en-IN')}</Text>
                  )}
                </View>
              </View>

              {/* Add to cart */}
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                <Text style={styles.addBtnText}>+ Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backText: { fontSize: 22, color: Colors.gray800 },
  headerTitle: { flex: 1, fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900 },
  headerCount: {
    fontSize: Typography.sm, color: Colors.white, fontWeight: Typography.bold,
    backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
  },
  grid: { padding: Spacing[4], gap: Spacing[3], paddingBottom: 32 },
  row: { gap: Spacing[3] },
  card: {
    flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
    ...Shadow.sm,
  },
  removeBtn: {
    position: 'absolute', top: Spacing[2], right: Spacing[2], zIndex: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  removeBtnText: { fontSize: 11, color: Colors.gray500, fontWeight: Typography.bold },
  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: Colors.gray100 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 32 },
  info: { padding: Spacing[2.5], gap: Spacing[1] },
  name: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray900 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[1.5] },
  price: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.gray900 },
  mrp: { fontSize: Typography.xs, color: Colors.gray400, textDecorationLine: 'line-through' },
  addBtn: {
    backgroundColor: Colors.primaryMuted, borderTopWidth: 1, borderTopColor: Colors.primaryBorder,
    paddingVertical: Spacing[2.5], alignItems: 'center',
  },
  addBtnText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary },
});
