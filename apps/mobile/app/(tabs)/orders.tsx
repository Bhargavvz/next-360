import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../lib/auth';
import { useOrders } from '../../lib/hooks/useOrders';
import { EmptyState } from '../../components/ui/EmptyState';
import { OrderCardSkeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';

const STATUS_CONFIG: Record<string, { variant: any; label: string; step: number }> = {
  PENDING:    { variant: 'warning', label: 'Pending', step: 1 },
  CONFIRMED:  { variant: 'info', label: 'Confirmed', step: 2 },
  PROCESSING: { variant: 'info', label: 'Processing', step: 3 },
  SHIPPED:    { variant: 'natural', label: 'Shipped', step: 4 },
  DELIVERED:  { variant: 'success', label: 'Delivered', step: 5 },
  CANCELLED:  { variant: 'error', label: 'Cancelled', step: 0 },
};

function OrderCard({ order }: { order: any }) {
  const statusCfg = STATUS_CONFIG[order.status] ?? { variant: 'default', label: order.status, step: 0 };
  const firstItem = order.items?.[0];
  const extraCount = (order.items?.length ?? 1) - 1;

  return (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.85}
      onPress={() => router.push(`/order/${order.id}`)}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{order.id?.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
      </View>

      {/* Item preview */}
      {firstItem && (
        <View style={styles.itemsPreview}>
          {firstItem.imageUrl ? (
            <Image source={{ uri: firstItem.imageUrl }} style={styles.itemThumb} />
          ) : (
            <View style={[styles.itemThumb, styles.thumbPlaceholder]}>
              <Text>📦</Text>
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{firstItem.productName}</Text>
            {extraCount > 0 && (
              <Text style={styles.moreItems}>+{extraCount} more item{extraCount !== 1 ? 's' : ''}</Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>₹{order.totalAmount?.toLocaleString('en-IN')}</Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const { data, isLoading, refetch } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const allOrders: any[] = data?.content ?? [];
  const activeStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'];
  const active = allOrders.filter((o) => activeStatuses.includes(o.status));
  const past = allOrders.filter((o) => !activeStatuses.includes(o.status));
  const orders = tab === 'active' ? active : past;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>
        <EmptyState
          icon="🔐"
          title="Sign in to view your orders"
          action={{ label: 'Sign In', onPress: () => router.push('/(auth)/login') }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
        {/* Tab switcher */}
        <View style={styles.tabSwitcher}>
          {(['active', 'past'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                {t === 'active' ? `Active (${active.length})` : `Past (${past.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={tab === 'active' ? '📭' : '📋'}
          title={tab === 'active' ? 'No active orders' : 'No past orders'}
          subtitle={tab === 'active' ? 'When you place an order, it will appear here' : 'Your completed orders will show here'}
          action={tab === 'active' ? { label: 'Start Shopping', onPress: () => router.push('/(tabs)/discover') } : undefined}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900, paddingTop: Spacing[3] },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.xl,
    padding: 3,
  },
  tabBtn: {
    flex: 1, paddingVertical: Spacing[2],
    borderRadius: Radius.lg, alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: Colors.white, ...{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 } },
  tabBtnText: { fontSize: Typography.sm, color: Colors.gray500, fontWeight: Typography.medium },
  tabBtnTextActive: { color: Colors.gray900, fontWeight: Typography.semibold },
  listContent: { padding: Spacing[4], gap: Spacing[3] },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  orderDate: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 2 },
  itemsPreview: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], backgroundColor: Colors.gray50, borderRadius: Radius.lg, padding: Spacing[3] },
  itemThumb: { width: 52, height: 52, borderRadius: Radius.md },
  thumbPlaceholder: { backgroundColor: Colors.gray200, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.gray800 },
  moreItems: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing[3] },
  orderTotal: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.gray900 },
  viewDetails: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
});
