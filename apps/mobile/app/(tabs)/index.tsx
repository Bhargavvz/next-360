import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useScreenInsets } from '../../lib/useScreenInsets';
import {
  Bell, Search, ShieldCheck, ChevronRight, ArrowRight, Star,
} from 'lucide-react-native';
import { useAuthStore } from '../../lib/auth';
import { useProducts, useCategories } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { LogoMark } from '../../components/ui/LogoMark';
import { CategoryTile } from '../../components/ui/CategoryTile';
import { ProductCard, type ProductCardData } from '../../components/ui/ProductCard';
import { ProductCardSkeleton, Skeleton } from '../../components/ui/Skeleton';
import { VerifiedSeal } from '../../components/ui/TrustMark';
import { Price } from '../../components/ui/Price';

function SectionHeader({
  eyebrow,
  title,
  onPress,
}: {
  eyebrow?: string;
  title: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing[5],
        marginBottom: Spacing[3],
      }}
    >
      <View style={{ flex: 1, gap: 1 }}>
        {eyebrow && (
          <Text variant="eyebrow" tone="primary">
            {eyebrow}
          </Text>
        )}
        {/* Section titles are one step down from screen titles — at the same
            size everything competes and the page reads as a list of banners. */}
        <Text variant="title" style={{ fontSize: 18 }}>
          {title}
        </Text>
      </View>
      {onPress && (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
        >
          <Text variant="label" tone="primary">
            See all
          </Text>
          <ChevronRight size={15} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useScreenInsets();
  const { width } = useWindowDimensions();
  const { colors, shadow } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [refreshing, setRefreshing] = useState(false);

  const { data: verifiedData, refetch: refetchVerified, isLoading: loadingVerified } =
    useProducts({ verifiedOnly: true, size: 8 });
  const { data: topData, refetch: refetchTop, isLoading: loadingTop } =
    useProducts({ sortBy: 'rating', size: 10 });
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const verified: ProductCardData[] = verifiedData?.pages?.[0]?.content ?? [];
  const top: ProductCardData[] = topData?.pages?.[0]?.content ?? [];
  const rootCategories = (categories ?? []).filter((c: any) => !c.parentId).slice(0, 10);

  // The feature slot takes the best-looking verified product — one with an
  // actual photograph, since the whole point is to lead with the image.
  const feature = verified.find((p) => p.primaryImageUrl) ?? top.find((p) => p.primaryImageUrl);
  const rail = verified.filter((p) => p.id !== feature?.id);
  const grid = top.filter((p) => p.id !== feature?.id);

  const gridWidth = (width - Spacing[5] * 2 - Spacing[3.5]) / 2;
  const railWidth = Math.min(150, width * 0.40);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchVerified(), refetchTop()]);
    setRefreshing(false);
  }, [refetchVerified, refetchTop]);

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ──────────────────────────────────────
          Compact by design. The old header spent a third of the first screen
          on a greeting; a shopper needs the search field and then products. */}
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: Spacing[5],
          paddingBottom: Spacing[3],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
          <LogoMark size={28} />
          <Text variant="displaySm" style={{ flex: 1, fontSize: 19 }}>
            Next360
          </Text>

          <Pressable
            onPress={() => router.push('/notifications')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={{
              width: 38,
              height: 38,
              borderRadius: Radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceSunken,
            }}
          >
            <Bell size={17} color={colors.text} strokeWidth={1.9} />
          </Pressable>
        </View>

        {/* Search hands off to Discover — typing here then navigating would
            drop the keyboard mid-stroke. */}
        <Pressable
          onPress={() => router.push('/(tabs)/discover')}
          accessibilityRole="search"
          accessibilityLabel="Search products"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing[2.5],
            height: 44,
            marginTop: Spacing[3],
            paddingHorizontal: Spacing[4],
            borderRadius: Radius.full,
            backgroundColor: colors.surfaceSunken,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={16} color={colors.textSubtle} />
          <Text variant="body" tone="subtle" numberOfLines={1} style={{ flex: 1 }}>
            Search honey, millets, oils…
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing[10] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Trust strip ───────────────────────────────
            The promise, as one tappable line rather than the 400pt manifesto
            that used to push every product below the fold. */}
        <Pressable
          onPress={() => router.push('/(tabs)/discover')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing[2.5],
            marginHorizontal: Spacing[5],
            marginBottom: Spacing[6],
            paddingVertical: Spacing[3],
            paddingHorizontal: Spacing[3.5],
            borderRadius: Radius.lg,
            backgroundColor: colors.sealMuted,
            borderWidth: 1,
            borderColor: colors.sealBorder,
          }}
        >
          <ShieldCheck size={17} color={colors.seal} strokeWidth={2.2} />
          <Text variant="caption" style={{ flex: 1, color: colors.seal }}>
            Every organic listing has a certificate we&rsquo;ve read
          </Text>
          <ChevronRight size={15} color={colors.seal} />
        </Pressable>

        {/* ── Categories ────────────────────────────── */}
        <View style={{ marginBottom: Spacing[7] }}>
          <SectionHeader title="Shop by category" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing[5], gap: Spacing[3] }}
          >
            {loadingCategories
              ? Array.from({ length: 5 }).map((_, i) => (
                  <View key={i} style={{ width: 78, alignItems: 'center', gap: Spacing[2] }}>
                    <Skeleton style={{ width: 64, height: 64, borderRadius: Radius.full }} />
                    <Skeleton style={{ height: 10, width: 48 }} />
                  </View>
                ))
              : rootCategories.map((category: any) => (
                  <CategoryTile
                    key={category.id}
                    name={category.name}
                    imageUrl={category.imageUrl}
                    onPress={() => router.push(`/category/${category.slug}`)}
                  />
                ))}
          </ScrollView>
        </View>

        {/* ── Feature ───────────────────────────────────
            One product given real estate, with its certificate status attached.
            This is where the brand voice lives now — attached to something you
            can actually buy, rather than as a standalone block of copy. */}
        {feature && (
          <Pressable
            onPress={() => router.push(`/product/${feature.id}`)}
            style={{ marginHorizontal: Spacing[5], marginBottom: Spacing[7] }}
          >
            <View
              style={{
                borderRadius: Radius['2xl'],
                overflow: 'hidden',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadow.sm,
              }}
            >
              <View style={{ height: 190, backgroundColor: colors.surfaceSunken }}>
                <Image
                  source={{ uri: feature.primaryImageUrl! }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={250}
                  cachePolicy="memory-disk"
                />
                {feature.isVerifiedOrganic && (
                  <View style={{ position: 'absolute', top: Spacing[3], left: Spacing[3] }}>
                    <VerifiedSeal size="md" />
                  </View>
                )}
              </View>

              <View style={{ padding: Spacing[4], gap: Spacing[1] }}>
                <Text variant="eyebrow" tone="primary">
                  Featured
                </Text>
                <Text variant="displaySm" numberOfLines={2}>
                  {feature.name}
                </Text>
                {feature.sellerName && (
                  <Text variant="caption" tone="secondary">
                    {feature.sellerName}
                  </Text>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: Spacing[2],
                  }}
                >
                  <Price value={feature.price} mrp={feature.mrp} size="md" />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text variant="label" tone="primary">
                      View
                    </Text>
                    <ArrowRight size={15} color={colors.primary} />
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        )}

        {/* ── Verified rail ─────────────────────────── */}
        {(loadingVerified || rail.length > 0) && (
          <View style={{ marginBottom: Spacing[7] }}>
            <SectionHeader
              eyebrow="Certified"
              title="Verified organic"
              onPress={() => router.push('/(tabs)/discover')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing[5], gap: Spacing[3.5] }}
              snapToInterval={railWidth + Spacing[3.5]}
              decelerationRate="fast"
            >
              {loadingVerified
                ? Array.from({ length: 3 }).map((_, i) => (
                    <ProductCardSkeleton key={i} style={{ width: railWidth }} />
                  ))
                : rail.slice(0, 8).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      layout="rail"
                      onAdd={handleAdd}
                      style={{ width: railWidth }}
                    />
                  ))}
            </ScrollView>
          </View>
        )}

        {/* ── Top rated grid ────────────────────────── */}
        <View>
          <SectionHeader
            eyebrow="Loved by buyers"
            title="Highest rated"
            onPress={() => router.push('/(tabs)/discover')}
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingHorizontal: Spacing[5],
              gap: Spacing[3.5],
            }}
          >
            {loadingTop
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} style={{ width: gridWidth }} />
                ))
              : grid.slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={handleAdd}
                    style={{ width: gridWidth }}
                  />
                ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
