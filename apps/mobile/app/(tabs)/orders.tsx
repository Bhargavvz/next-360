import React, { useCallback, useState } from 'react';
import { View, FlatList, Pressable, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { Package, Lock, ChevronRight, Leaf } from 'lucide-react-native';
import { useOrders } from '../../lib/hooks/useOrders';
import { useAuthStore } from '../../lib/auth';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import { formatInr } from '../../components/ui/Price';

/**
 * Status presentation.
 *
 * `tone` maps onto the palette rather than a raw colour so the badge adapts to
 * dark mode; `active` decides which tab an order falls into.
 */
const STATUS: Record<
  string,
  { label: string; tone: 'primary' | 'success' | 'warning' | 'error' | 'subtle'; active: boolean }
> = {
  PLACED: { label: 'Placed', tone: 'warning', active: true },
  PAYMENT_CONFIRMED: { label: 'Confirmed', tone: 'primary', active: true },
  PROCESSING: { label: 'Processing', tone: 'primary', active: true },
  PACKED: { label: 'Packed', tone: 'primary', active: true },
  SHIPPED: { label: 'Shipped', tone: 'primary', active: true },
  OUT_FOR_DELIVERY: { label: 'Out for delivery', tone: 'primary', active: true },
  DELIVERED: { label: 'Delivered', tone: 'success', active: false },
  CANCELLED: { label: 'Cancelled', tone: 'error', active: false },
  RETURN_REQUESTED: { label: 'Return requested', tone: 'warning', active: false },
  RETURNED: { label: 'Returned', tone: 'subtle', active: false },
  REFUNDED: { label: 'Refunded', tone: 'subtle', active: false },
};

function StatusPill({ status }: { status: string }) {
  const { colors } = useTheme();
  const config = STATUS[status] ?? { label: status, tone: 'subtle' as const, active: true };

  const tones = {
    primary: { fg: colors.primary, bg: colors.primaryMuted },
    success: { fg: colors.success, bg: colors.successMuted },
    warning: { fg: colors.warning, bg: colors.warningMuted },
    error: { fg: colors.error, bg: colors.errorMuted },
    subtle: { fg: colors.textSecondary, bg: colors.surfaceSunken },
  }[config.tone];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing[2],
        paddingVertical: 3,
        borderRadius: Radius.xs,
        backgroundColor: tones.bg,
      }}
    >
      <Text variant="eyebrow" style={{ color: tones.fg }}>
        {config.label}
      </Text>
    </View>
  );
}

export default function OrdersScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useOrders();
  const orders: any[] = data?.content ?? [];

  const filtered = orders.filter((order) => {
    const config = STATUS[order.status];
    return tab === 'active' ? config?.active ?? true : !(config?.active ?? true);
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
          <Text variant="display" style={{ fontSize: 28 }}>
            Orders
          </Text>
        </View>
        <EmptyState
          icon={<Lock size={26} color={colors.primary} />}
          title="Sign in to track orders"
          subtitle="Your order history and delivery updates live in your account."
          action={{ label: 'Sign in', onPress: () => router.push('/(auth)/login') }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
        <Text variant="display" style={{ fontSize: 28 }}>
          Orders
        </Text>
      </View>

      {/* Segmented control */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: Spacing[5],
          marginBottom: Spacing[4],
          padding: 3,
          borderRadius: Radius.full,
          backgroundColor: colors.surfaceSunken,
        }}
      >
        {(['active', 'past'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
            style={{
              flex: 1,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Radius.full,
              backgroundColor: tab === key ? colors.surface : 'transparent',
            }}
          >
            <Text variant="label" tone={tab === key ? 'default' : 'subtle'}>
              {key === 'active' ? 'Active' : 'Past'}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: Spacing[5], gap: Spacing[3] }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="none">
              <OrderCardSkeleton />
            </Card>
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing[5],
            paddingBottom: Spacing[16],
            gap: Spacing[3],
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/order/${item.id}`)}>
              <Card padding="sm" style={{ flexDirection: 'row', gap: Spacing[3] }}>
                <View
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: Radius.md,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceSunken,
                  }}
                >
                  {item.firstProductImage ? (
                    <Image
                      source={{ uri: item.firstProductImage }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Leaf size={20} color={colors.borderStrong} strokeWidth={1.25} />
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, gap: 3, justifyContent: 'center' }}>
                  <StatusPill status={item.status} />
                  <Text variant="label" numberOfLines={1}>
                    {item.firstProductName ?? 'Order'}
                    {item.itemCount > 1 && ` + ${item.itemCount - 1} more`}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {item.orderNumber} ·{' '}
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
                  <Text variant="bodyMedium">₹{formatInr(item.finalAmount ?? 0)}</Text>
                  <ChevronRight size={16} color={colors.textSubtle} />
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Package size={26} color={colors.primary} />}
              title={tab === 'active' ? 'No active orders' : 'Nothing here yet'}
              subtitle={
                tab === 'active'
                  ? 'Orders you place will show up here with live delivery updates.'
                  : 'Delivered and cancelled orders will be archived here.'
              }
              action={
                tab === 'active'
                  ? { label: 'Start shopping', onPress: () => router.push('/(tabs)/discover') }
                  : undefined
              }
            />
          }
        />
      )}
    </View>
  );
}
