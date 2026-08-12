import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../lib/auth';
import { useProducts, useCategories } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useWishlistStore } from '../../lib/store/wishlist';
import { ProductCard, ProductListCard, Product } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { Colors, Spacing, Typography, Radius, Shadow } from '../../lib/theme';
import { Bell, Search, Leaf, Sprout, ShoppingBag, Carrot, Apple, Coffee, Sparkles } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fallback icons for categories if we want to display a rich grid
const CATEGORY_ICONS: Record<string, any> = {
  'vegetables': Carrot,
  'fruits': Apple,
  'dairy': Coffee,
  'grocery': ShoppingBag,
};

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

  const scrollY = useRef(new Animated.Value(0)).current;

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

  const getCategoryIcon = (slug: string) => {
    const Icon = CATEGORY_ICONS[slug.toLowerCase()] || ShoppingBag;
    return <Icon size={24} color={Colors.primary} strokeWidth={1.5} />;
  };

  // Header opacity for glassmorphism effect when scrolling
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.root}>
      {/* Absolute Header (Floats above ScrollView) */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + Spacing[2] }]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.headerBlur, { opacity: headerOpacity }]} />
        <View style={styles.headerContent}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>
              {isAuthenticated && user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.notifBtn} activeOpacity={0.8}>
            <Bell size={20} color={Colors.white} strokeWidth={2.5} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} progressViewOffset={insets.top + 60} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HERO SECTION WRAPPER */}
        <View style={{ position: 'relative', zIndex: 10 }}>
          <View style={[styles.heroSection, { paddingTop: insets.top + 70 }]}>
            {/* Decorative Background Circles */}
            <View style={styles.heroDeco1} />
            <View style={styles.heroDeco2} />

            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Sparkles size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.heroBadgeText}>NPOP CERTIFIED</Text>
              </View>
              <Text style={styles.heroTitle}>Fresh from Farm{'\n'}to your Doorstep</Text>
              <Text style={styles.heroSub}>Get up to 40% OFF on organic groceries today.</Text>
            </View>
          </View>

          {/* Search Bar - Floats between Hero and Content */}
          <View style={styles.searchWrapper}>
            <TouchableOpacity
              style={styles.searchBar}
              activeOpacity={0.9}
              onPress={() => router.push('/(tabs)/discover')}
            >
              <Search size={20} color={Colors.gray400} strokeWidth={2.5} />
              <Text style={styles.searchPlaceholder}>Search "Organic Apples"...</Text>
              <View style={styles.searchAction}>
                <Text style={styles.searchActionText}>GO</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* MAIN CONTENT AREA */}
        <View style={styles.contentArea}>

          {/* Category Grid - 2 Rows */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categoryGrid}>
              <TouchableOpacity
                style={styles.categoryCard}
                onPress={() => router.push('/(tabs)/discover')}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIconBg, { backgroundColor: Colors.primaryMuted }]}>
                  <Leaf size={24} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.categoryName}>All Items</Text>
              </TouchableOpacity>

              {categories?.slice(0, 7).map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => router.push(`/category/${cat.slug}`)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconBg, { backgroundColor: '#f3f4f6' }]}>
                    {getCategoryIcon(cat.name)}
                  </View>
                  <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Trending Products (Horizontal Scroll) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stripRow}>
              {trending.length === 0
                ? [1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
                : trending.map((p: any) => (
                  <View key={p.id}>
                    <ProductListCard
                      product={{ ...p, inStock: p.inStock }}
                      onAddToCart={handleAddToCart}
                    />
                  </View>
                ))}
            </ScrollView>
          </View>

          {/* Organic Highlights Section */}
          {organic.length > 0 && (
            <View style={styles.organicWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>100% Certified Organic</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/discover', params: { verifiedOrganic: '1' } })}>
                  <Text style={[styles.seeAll, { color: Colors.primary }]}>Explore All</Text>
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
              <Text style={styles.sectionTitle}>Fresh Picks For You</Text>
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

        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    backgroundColor: 'rgba(5, 150, 105, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[6],
    paddingBottom: Spacing[4],
  },
  greetingRow: {
    flex: 1,
  },
  greetingText: {
    fontSize: Typography.xl,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  heroSection: {
    backgroundColor: '#059669', // Deep Emerald Green
    paddingHorizontal: Spacing[6],
    paddingBottom: 70, // Room for floating search bar
    position: 'relative',
    overflow: 'hidden',
  },
  heroDeco1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroDeco2: {
    position: 'absolute',
    bottom: -100,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    marginTop: Spacing[4],
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderRadius: Radius.full,
    marginBottom: Spacing[4],
    gap: 4,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 40,
    letterSpacing: -1,
    marginBottom: Spacing[2],
  },
  heroSub: {
    fontSize: Typography.base,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  searchWrapper: {
    position: 'absolute',
    bottom: -28,
    left: Spacing[6],
    right: Spacing[6],
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius['2xl'],
    paddingLeft: Spacing[5],
    paddingRight: Spacing[2],
    paddingVertical: Spacing[2],
    height: 64,
    ...Shadow.md,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.gray400,
    marginLeft: Spacing[3],
  },
  searchAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[4],
    height: '100%',
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchActionText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: Typography.sm,
  },
  contentArea: {
    paddingTop: 60, // Increased space for the bottom half of search bar
  },
  section: {
    paddingHorizontal: Spacing[6],
    marginBottom: Spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gray900,
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: Typography.sm,
    color: Colors.gray500,
    fontWeight: '700',
    paddingBottom: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (SCREEN_WIDTH - Spacing[6] * 2 - Spacing[3] * 3) / 4, // 4 columns
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[2],
  },
  categoryIconBg: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray700,
    textAlign: 'center',
  },
  stripRow: {
    gap: Spacing[4],
    paddingRight: Spacing[6],
  },
  organicWrapper: {
    backgroundColor: '#F0FDF4', // Very light green
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
    paddingHorizontal: Spacing[6],
    marginBottom: Spacing[8],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing[4],
  },
});
