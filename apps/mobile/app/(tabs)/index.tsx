import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../lib/auth';
import { useProducts, useCategories } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useWishlistStore } from '../../lib/store/wishlist';
import { ProductCard, ProductListCard, Product } from '../../components/ui/ProductCard';
import { Skeleton, ProductCardSkeleton } from '../../components/ui/Skeleton';
import { Colors, Spacing, Typography, Radius, Shadow } from '../../lib/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const addToCart = useCartStore((s) => s.addItem);
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore();

  const { data: trendingData, refetch: refetchTrending } = useProducts({ sortBy: 'rating', size: 8 });
  const { data: organicData, refetch: refetchOrganic } = useProducts({ verifiedOrganic: true, size: 6 });
  const { data: freshData, refetch: refetchFresh } = useProducts({ sortBy: 'relevance', size: 8 });
  const { data: categories } = useCategories();

  const trending = trendingData?.pages?.[0]?.content ?? [];
  const organic = organicData?.pages?.[0]?.content ?? [];
  const fresh = freshData?.pages?.[0]?.content ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchTrending(), refetchOrganic(), refetchFresh()]);
    setRefreshing(false);
  };

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

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing[3] }]}>
        <View>
          <Text style={styles.greeting}>
            {isAuthenticated && user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Good day!'}
          </Text>
          <Text style={styles.headerSub}>Discover fresh organic products</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn}>
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar (tap → go to Discover) */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/discover')}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search for organic products...</Text>
      </TouchableOpacity>

      {/* Category pills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
          <TouchableOpacity
            style={[styles.pill, styles.pillActive]}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.pillEmoji}>🌿</Text>
            <Text style={[styles.pillText, styles.pillTextActive]}>All</Text>
          </TouchableOpacity>
          {categories?.slice(0, 8).map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.pill}
              onPress={() => router.push(`/category/${cat.slug}`)}
            >
              <Text style={styles.pillText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trending products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Today</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripRow}>
          {trending.length === 0
            ? [1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
            : trending.map((p: any) => (
                <View key={p.id} style={styles.stripCard}>
                  <ProductListCard
                    product={{ ...p, inStock: p.inStock }}
                    onAddToCart={handleAddToCart}
                  />
                </View>
              ))}
        </ScrollView>
      </View>

      {/* NPOP Verified Organic Banner */}
      <TouchableOpacity
        style={styles.organicBanner}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/(tabs)/discover', params: { verifiedOrganic: '1' } })}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerBadge}>NPOP CERTIFIED</Text>
          <Text style={styles.bannerTitle}>100% Verified{'\n'}Organic Products</Text>
          <Text style={styles.bannerSub}>Certified by the National Programme for Organic Production</Text>
          <View style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Shop Now →</Text>
          </View>
        </View>
        <Text style={styles.bannerEmoji}>🌱</Text>
      </TouchableOpacity>

      {/* Organic products grid */}
      {organic.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Verified Organic</Text>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/discover', params: { verifiedOrganic: '1' } })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {organic.slice(0, 4).map((p: any) => (
              <ProductCard
                key={p.id}
                product={{ ...p, inStock: p.inStock }}
                isWishlisted={isWishlisted(p.id)}
                onWishlistToggle={(id) => toggleWishlist({ productId: id, slug: p.slug, name: p.name, imageUrl: p.imageUrl, price: p.price, mrp: p.mrp, productType: p.productType, sellerName: p.sellerName })}
                onAddToCart={handleAddToCart}
              />
            ))}
          </View>
        </View>
      )}

      {/* Fresh Picks section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fresh Picks</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.grid}>
          {fresh.length === 0
            ? [1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)
            : fresh.slice(0, 4).map((p: any) => (
                <ProductCard
                  key={p.id}
                  product={{ ...p, inStock: p.inStock }}
                  isWishlisted={isWishlisted(p.id)}
                  onWishlistToggle={(id) => toggleWishlist({ productId: id, slug: p.slug, name: p.name, imageUrl: p.imageUrl, price: p.price, mrp: p.mrp, productType: p.productType, sellerName: p.sellerName })}
                  onAddToCart={handleAddToCart}
                />
              ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
    backgroundColor: Colors.white,
  },
  greeting: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  headerSub: {
    fontSize: Typography.sm,
    color: Colors.gray400,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  notifIcon: {
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginHorizontal: Spacing[5],
    marginTop: Spacing[3],
    marginBottom: Spacing[1],
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.gray400,
  },
  section: {
    marginTop: Spacing[5],
    paddingHorizontal: Spacing[5],
    gap: Spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  seeAll: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    paddingRight: Spacing[5],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillEmoji: {
    fontSize: 13,
  },
  pillText: {
    fontSize: Typography.sm,
    color: Colors.gray600,
    fontWeight: Typography.medium,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: Typography.semibold,
  },
  stripRow: {
    gap: Spacing[3],
  },
  stripCard: {
    marginLeft: 0,
  },
  organicBanner: {
    marginHorizontal: Spacing[5],
    marginTop: Spacing[5],
    borderRadius: Radius['2xl'],
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[5],
    overflow: 'hidden',
    ...Shadow.md,
  },
  bannerContent: {
    flex: 1,
    gap: Spacing[2],
  },
  bannerBadge: {
    fontSize: 9,
    fontWeight: Typography.bold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bannerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.extrabold,
    color: Colors.white,
    lineHeight: 26,
  },
  bannerSub: {
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 16,
  },
  bannerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.md,
    marginTop: Spacing[1],
  },
  bannerBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
  bannerEmoji: {
    fontSize: 64,
    opacity: 0.35,
    position: 'absolute',
    right: Spacing[4],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
});
