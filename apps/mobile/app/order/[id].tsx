import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrder } from '../../lib/hooks/useOrders';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';
import { api } from '../../lib/api';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const STATUS_CONFIG: Record<string, { variant: any; label: string; icon: string; desc: string }> = {
  PENDING:    { variant: 'warning',  label: 'Pending',    icon: '🕐', desc: 'Order placed, awaiting confirmation' },
  CONFIRMED:  { variant: 'info',    label: 'Confirmed',  icon: '✓',  desc: 'Order confirmed by seller' },
  PROCESSING: { variant: 'info',    label: 'Processing', icon: '📦', desc: 'Packing your order' },
  SHIPPED:    { variant: 'natural', label: 'Shipped',    icon: '🚚', desc: 'On the way to you' },
  DELIVERED:  { variant: 'success', label: 'Delivered',  icon: '🎉', desc: 'Delivered successfully' },
  CANCELLED:  { variant: 'error',   label: 'Cancelled',  icon: '✕',  desc: 'Order was cancelled' },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: order, isLoading, refetch } = useOrder(id);
  const [cancelling, setCancelling] = useState(false);

  if (isLoading || !order) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: Spacing[5], gap: Spacing[4] }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={80} radius={16} />)}
        </ScrollView>
      </View>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const canCancel = order.status === 'PENDING';
  const canReview = order.status === 'DELIVERED';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await api.post(`/api/v1/orders/${id}/cancel`);
              await refetch();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error?.message ?? 'Failed to cancel order');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Status + Order info */}
        <View style={styles.statusCard}>
          <View style={styles.statusCardTop}>
            <View style={styles.statusIconBg}>
              <Text style={styles.statusIcon}>{statusCfg.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Badge variant={statusCfg.variant} size="sm">{statusCfg.label}</Badge>
              <Text style={styles.statusDesc}>{statusCfg.desc}</Text>
            </View>
          </View>
          <View style={styles.orderMeta}>
            <Text style={styles.orderMetaText}>Order #{order.id?.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderMetaText}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Status timeline */}
        {order.status !== 'CANCELLED' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Timeline</Text>
            {STATUS_STEPS.map((step, i) => {
              const isDone = currentStep >= i;
              const isCurrent = currentStep === i;
              const cfg = STATUS_CONFIG[step];
              return (
                <View key={step} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, isDone ? styles.timelineDotDone : styles.timelineDotPending]}>
                      {isDone && <Text style={styles.timelineDotCheck}>✓</Text>}
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View style={[styles.timelineLine, isDone && i < currentStep ? styles.timelineLineDone : undefined]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineLabel, isCurrent && styles.timelineLabelCurrent]}>
                      {cfg.label}
                    </Text>
                    <Text style={styles.timelineDesc}>{cfg.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Order items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {order.items?.map((item: any) => (
            <View key={item.id} style={styles.orderItem}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.itemPlaceholder]}>
                  <Text>📦</Text>
                </View>
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                <Text style={styles.itemPrice}>₹{item.price?.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery address */}
        {order.deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressBlock}>
              <Text style={styles.addressName}>{order.deliveryAddress.fullName}</Text>
              <Text style={styles.addressText}>
                {[order.deliveryAddress.addressLine1, order.deliveryAddress.addressLine2, order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.pincode].filter(Boolean).join(', ')}
              </Text>
              <Text style={styles.addressPhone}>{order.deliveryAddress.phone}</Text>
            </View>
          </View>
        )}

        {/* Price summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total</Text>
            <Text style={styles.summaryValue}>₹{order.subtotalAmount?.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.summaryValue}>
              {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}
            </Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>−₹{order.discountAmount}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount?.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <Text style={styles.cancelBtnText}>Cancel Order</Text>
              )}
            </TouchableOpacity>
          )}
          {canReview && (
            <TouchableOpacity style={styles.reviewBtn}>
              <Text style={styles.reviewBtnText}>Rate & Review</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.helpBtn} onPress={() => router.push('/help')}>
            <Text style={styles.helpBtnText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: Colors.gray800 },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
  statusCard: {
    margin: Spacing[4],
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[4], gap: Spacing[3],
  },
  statusCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  statusIconBg: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  statusIcon: { fontSize: 22 },
  statusDesc: { fontSize: Typography.sm, color: Colors.gray500, marginTop: 3 },
  orderMeta: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing[3] },
  orderMetaText: { fontSize: Typography.xs, color: Colors.gray400, fontWeight: Typography.medium },
  section: {
    marginHorizontal: Spacing[4], marginBottom: Spacing[3],
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[4], gap: Spacing[3],
  },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  timelineRow: { flexDirection: 'row', gap: Spacing[3], minHeight: 52 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timelineDotPending: { backgroundColor: Colors.white, borderColor: Colors.gray300 },
  timelineDotCheck: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  timelineLine: { flex: 1, width: 2, backgroundColor: Colors.gray200, marginVertical: 2 },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, paddingBottom: Spacing[3] },
  timelineLabel: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.gray400 },
  timelineLabelCurrent: { color: Colors.primary, fontWeight: Typography.bold },
  timelineDesc: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 2 },
  orderItem: { flexDirection: 'row', gap: Spacing[3], alignItems: 'center' },
  itemImage: { width: 64, height: 64, borderRadius: Radius.md },
  itemPlaceholder: { backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  itemDetails: { flex: 1, gap: 3 },
  itemName: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.gray900 },
  itemQty: { fontSize: Typography.xs, color: Colors.gray400 },
  itemPrice: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  addressBlock: { gap: 3 },
  addressName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  addressText: { fontSize: Typography.sm, color: Colors.gray500, lineHeight: 20 },
  addressPhone: { fontSize: Typography.sm, color: Colors.gray400 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: Typography.sm, color: Colors.gray500 },
  summaryValue: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray900 },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing[3], marginTop: Spacing[1] },
  totalLabel: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.gray900 },
  totalValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.gray900 },
  actionsSection: { marginHorizontal: Spacing[4], marginBottom: Spacing[4], gap: Spacing[2] },
  cancelBtn: { backgroundColor: Colors.errorLight, borderRadius: Radius.xl, borderWidth: 1, borderColor: '#fecaca', paddingVertical: Spacing[4], alignItems: 'center' },
  cancelBtnText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.error },
  reviewBtn: { backgroundColor: Colors.primaryMuted, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.primaryBorder, paddingVertical: Spacing[4], alignItems: 'center' },
  reviewBtnText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.primary },
  helpBtn: { backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, paddingVertical: Spacing[4], alignItems: 'center' },
  helpBtnText: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.gray700 },
});
