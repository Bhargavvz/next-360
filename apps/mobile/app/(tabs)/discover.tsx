import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, ArrowDownUp, Check, PackageSearch, ShieldCheck } from 'lucide-react-native';
import { useProducts } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useAuthStore } from '../../lib/auth';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { router } from 'expo-router';
import { Text } from '../../components/ui/Text';
import { ProductCard, type ProductCardData } from '../../components/ui/ProductCard';
import { ProductCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { PRODUCT_TYPES, type ProductType } from '../../components/ui/TrustMark';

const SORTS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
  { label: 'Top rated', value: 'rating' },
] as const;

const TYPE_KEYS = Object.keys(PRODUCT_TYPES) as ProductType[];

/** Pill filter used for both the verified toggle and the type chips. */
function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        height: 36,
        paddingHorizontal: Spacing[3.5],
        borderRadius: Radius.full,
        backgroundColor: active ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
      }}
    >
      {icon}
      <Text variant="label" style={{ color: active ? colors.primaryOn : colors.textSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof SORTS)[number]['value']>('relevance');
  const [sortOpen, setSortOpen] = useState(false);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } = useProducts({
    q: search || undefined,
    productType: productType || undefined,
    verifiedOrganic: verifiedOnly || undefined,
    sortBy,
  });

  const products: ProductCardData[] = useMemo(
    () => data?.pages.flatMap((p: any) => p.content) ?? [],
    [data]
  );
  const total = (data?.pages?.[0] as any)?.totalElements ?? products.length;

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

  const activeSort = SORTS.find((s) => s.value === sortBy)?.label ?? 'Relevance';
  const hasFilters = !!search || !!productType || verifiedOnly;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Search + filters ───────────────────────────── */}
      <View
        style={{
          paddingTop: insets.top + Spacing[2],
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing[2.5],
            paddingHorizontal: Spacing[5],
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing[2.5],
              height: 46,
              paddingHorizontal: Spacing[4],
              borderRadius: Radius.full,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Search size={17} color={colors.textSubtle} />
            <TextInput
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => setSearch(input.trim())}
              placeholder="Search products"
              placeholderTextColor={colors.textSubtle}
              returnKeyType="search"
              style={{ flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 }}
            />
            {!!input && (
              <Pressable
                onPress={() => {
                  setInput('');
                  setSearch('');
                }}
                hitSlop={8}
                accessibilityLabel="Clear search"
              >
                <X size={16} color={colors.textSubtle} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => setSortOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${activeSort}`}
            style={{
              width: 46,
              height: 46,
              borderRadius: Radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <ArrowDownUp size={17} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: Spacing[5],
            paddingVertical: Spacing[3],
            gap: Spacing[2],
          }}
        >
          <Chip
            label="NPOP verified"
            active={verifiedOnly}
            onPress={() => setVerifiedOnly((v) => !v)}
            icon={
              <ShieldCheck
                size={14}
                color={verifiedOnly ? colors.primaryOn : colors.seal}
                strokeWidth={2.4}
              />
            }
          />
          <Chip label="All types" active={!productType} onPress={() => setProductType('')} />
          {TYPE_KEYS.map((key) => (
            <Chip
              key={key}
              label={PRODUCT_TYPES[key].label}
              active={productType === key}
              onPress={() => setProductType(productType === key ? '' : key)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Results ────────────────────────────────────── */}
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
          // Prefetch a screen early so the grid never shows a spinner mid-scroll.
          onEndReachedThreshold={0.6}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          ListHeaderComponent={
            products.length > 0 ? (
              <Text variant="caption" tone="subtle">
                {total} {total === 1 ? 'product' : 'products'}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <ProductCard product={item} onAdd={handleAdd} style={{ width: gridWidth }} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<PackageSearch size={26} color={colors.primary} />}
              title="Nothing matched"
              subtitle={
                hasFilters
                  ? 'Try removing a filter or searching for something broader.'
                  : 'No products are listed yet. Check back shortly.'
              }
              action={
                hasFilters
                  ? {
                      label: 'Clear filters',
                      onPress: () => {
                        setInput('');
                        setSearch('');
                        setProductType('');
                        setVerifiedOnly(false);
                      },
                    }
                  : undefined
              }
            />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing[5] }} />
            ) : null
          }
        />
      )}

      {/* ── Sort sheet ─────────────────────────────────── */}
      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)} title="Sort by">
        {SORTS.map((sort) => (
          <Pressable
            key={sort.value}
            onPress={() => {
              setSortBy(sort.value);
              setSortOpen(false);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: Spacing[3.5],
            }}
          >
            <Text variant="body" tone={sortBy === sort.value ? 'primary' : 'default'}>
              {sort.label}
            </Text>
            {sortBy === sort.value && <Check size={18} color={colors.primary} strokeWidth={2.5} />}
          </Pressable>
        ))}
      </BottomSheet>
    </View>
  );
}
