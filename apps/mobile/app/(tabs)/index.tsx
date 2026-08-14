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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell, Search, ShieldCheck, ChevronRight, Leaf, ArrowRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../lib/auth';
import { useProducts, useCategories } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { ProductCard, type ProductCardData } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { VerifiedSeal } from '../../components/ui/TrustMark';

/** Section heading with an optional "see all" affordance. */
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
        marginBottom: Spacing[3.5],
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        {eyebrow && (
          <Text variant="eyebrow" tone="primary">
            {eyebrow}
          </Text>
        )}
        <Text variant="displaySm">{title}</Text>
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
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [refreshing, setRefreshing] = useState(false);

  const { data: verifiedData, refetch: refetchVerified, isLoading: loadingVerified } =
    useProducts({ verifiedOrganic: true, size: 6 });
  const { data: topData, refetch: refetchTop, isLoading: loadingTop } =
    useProducts({ sortBy: 'rating', size: 8 });
  const { data: categories } = useCategories();

  const verified: ProductCardData[] = verifiedData?.pages?.[0]?.content ?? [];
  const top: ProductCardData[] = topData?.pages?.[0]?.content ?? [];
  const rootCategories = (categories ?? []).filter((c: any) => !c.parentId).slice(0, 8);

  // Two-up grid with a 20pt gutter each side and 14pt between columns.
  const gridWidth = (width - Spacing[5] * 2 - Spacing[3.5]) / 2;
  const railWidth = Math.min(160, width * 0.42);

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

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ─────────────────────────────────────── */}
      <View
        style={{
          paddingTop: insets.top + Spacing[2],
          paddingHorizontal: Spacing[5],
          paddingBottom: Spacing[3],
          backgroundColor: colors.background,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" tone="subtle">
              {greeting}
            </Text>
            <Text variant="displaySm" numberOfLines={1}>
              {isAuthenticated ? user?.name || 'Welcome back' : 'Shop verified organic'}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push('/notifications')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={{
              width: 42,
              height: 42,
              borderRadius: Radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Bell size={19} color={colors.text} strokeWidth={1.9} />
          </Pressable>
        </View>

        {/* Search — a button that hands off to Discover, not a live field.
            Typing here then navigating loses the keyboard mid-stroke. */}
        <Pressable
          onPress={() => router.push('/(tabs)/discover')}
          accessibilityRole="search"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing[2.5],
            height: 46,
            marginTop: Spacing[3.5],
            paddingHorizontal: Spacing[4],
            borderRadius: Radius.full,
            backgroundColor: colors.surfaceSunken,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Search size={17} color={colors.textSubtle} />
          <Text variant="body" tone="subtle">
            Search honey, millets, cold-pressed oils…
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
        {/* ── Trust banner ─────────────────────────────── */}
        <Pressable
          onPress={() => router.push('/(tabs)/discover')}
          style={{ paddingHorizontal: Spacing[5], marginBottom: Spacing[7] }}
        >
          <Card variant="seal" padding="lg">
            <VerifiedSeal size="md" />
            <Text variant="displaySm" style={{ marginTop: Spacing[3] }}>
              Every organic claim, checked by a human
            </Text>
            <Text variant="body" tone="secondary" style={{ marginTop: Spacing[1.5] }}>
              We read the NPOP certificate before the product goes live — and show it to you.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: Spacing[3.5],
              }}
            >
              <Text variant="label" tone="seal">
                Browse verified organic
              </Text>
              <ArrowRight size={15} color={colors.seal} />
            </View>
          </Card>
        </Pressable>

        {/* ── Categories ───────────────────────────────── */}
        {rootCategories.length > 0 && (
          <View style={{ marginBottom: Spacing[8] }}>
            <SectionHeader eyebrow="Browse" title="Categories" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing[5], gap: Spacing[3] }}
            >
              {rootCategories.map((category: any) => (
                <Pressable
                  key={category.id}
                  onPress={() => router.push(`/category/${category.slug}`)}
                  style={{ alignItems: 'center', width: 76, gap: Spacing[2] }}
                >
                  <View
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: Radius.full,
                      backgroundColor: colors.primaryMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {category.imageUrl ? (
                      <Image
                        source={{ uri: category.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                    ) : (
                      <Leaf size={25} color={colors.primary} strokeWidth={1.5} />
                    )}
                  </View>
                  <Text variant="caption" center numberOfLines={2}>
                    {category.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Verified rail ────────────────────────────── */}
        <View style={{ marginBottom: Spacing[8] }}>
          <SectionHeader
            eyebrow="Certified"
            title="Verified organic"
            onPress={() => router.push('/(tabs)/discover')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing[5], gap: Spacing[3.5] }}
            // Snapping makes the rail feel deliberate rather than a loose scroll.
            snapToInterval={railWidth + Spacing[3.5]}
            decelerationRate="fast"
          >
            {loadingVerified
              ? Array.from({ length: 3 }).map((_, i) => (
                  <ProductCardSkeleton key={i} style={{ width: railWidth }} />
                ))
              : (verified.length ? verified : top).slice(0, 6).map((product) => (
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

        {/* ── Top rated grid ───────────────────────────── */}
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
              : top.slice(0, 6).map((product) => (
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
