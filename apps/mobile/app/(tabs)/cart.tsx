import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../lib/store/cart';
import { useAuthStore } from '../../lib/auth';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Typography, Radius, Shadow } from '../../lib/theme';

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 499;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    couponCode,
    couponDiscount,
    subtotal,
    total,
    totalItems,
    updateQuantity,
    removeItem,
    applyCoupon,
    clearCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState('');

  const sub = subtotal();
  const delivery = sub >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const tot = total();

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <EmptyState
          icon="🔐"
          title="Sign in to view your cart"
          subtitle="Your cart is saved when you sign in"
          action={{ label: 'Sign In', onPress: () => router.push('/(auth)/login') }}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          subtitle="Add some fresh organic products to get started"
          action={{ label: 'Browse Products', onPress: () => router.push('/(tabs)/discover') }}
        />
      </View>
    );
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    const result = await applyCoupon(couponInput.trim().toUpperCase());
    setCouponMsg(result.message);
    if (result.success) setCouponInput('');
    setCouponLoading(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cart</Text>
        <Text style={styles.headerCount}>{totalItems()} item{totalItems() !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cart Items */}
        <View style={styles.section}>
          {items.map((item) => (
            <View key={item.productId} style={styles.cartItem}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                  <Text>📦</Text>
                </View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                {item.sellerName && <Text style={styles.itemSeller}>{item.sellerName}</Text>}
                <Text style={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>{item.quantity === 1 ? '🗑' : '−'}</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, styles.qtyBtnAdd]}
                  onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  <Text style={[styles.qtyBtnText, { color: Colors.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Coupon */}
        <View style={[styles.section, styles.couponSection]}>
          <Text style={styles.sectionTitle}>Coupon Code</Text>
          {couponCode ? (
            <View style={styles.couponApplied}>
              <View style={styles.couponAppliedLeft}>
                <Text style={styles.couponAppliedIcon}>✓</Text>
                <View>
                  <Text style={styles.couponAppliedCode}>{couponCode}</Text>
                  <Text style={styles.couponAppliedSavings}>You save ₹{couponDiscount}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={clearCoupon}>
                <Text style={styles.couponRemove}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  placeholderTextColor={Colors.gray400}
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.couponApplyBtn}
                  onPress={handleApplyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.couponApplyText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
              {couponMsg ? (
                <Text style={[styles.couponMsg, { color: couponMsg.includes('save') ? Colors.success : Colors.error }]}>
                  {couponMsg}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* Order Summary */}
        <View style={[styles.section, styles.summarySection]}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({totalItems()} items)</Text>
            <Text style={styles.summaryValue}>₹{sub.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            {delivery === 0 ? (
              <Text style={[styles.summaryValue, { color: Colors.success }]}>FREE</Text>
            ) : (
              <Text style={styles.summaryValue}>₹{delivery}</Text>
            )}
          </View>
          {couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>Coupon Discount</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>−₹{couponDiscount}</Text>
            </View>
          )}
          {delivery > 0 && (
            <Text style={styles.freeDeliveryHint}>
              Add ₹{(FREE_DELIVERY_THRESHOLD - sub).toFixed(0)} more for FREE delivery
            </Text>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{tot.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout bar */}
      <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + Spacing[3] }]}>
        <View>
          <Text style={styles.checkoutTotal}>₹{tot.toLocaleString('en-IN')}</Text>
          <Text style={styles.checkoutItems}>{totalItems()} items</Text>
        </View>
        <Button
          size="lg"
          onPress={() => router.push('/checkout')}
          style={{ flex: 1 } as any}
        >
          Proceed to Checkout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900 },
  headerCount: { fontSize: Typography.sm, color: Colors.gray400 },
  scroll: { paddingBottom: 100, gap: Spacing[3], padding: Spacing[4] },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing[3],
  },
  itemImage: { width: 72, height: 72, borderRadius: Radius.lg },
  imagePlaceholder: { backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1, gap: 3 },
  itemName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray900 },
  itemSeller: { fontSize: Typography.xs, color: Colors.gray400 },
  itemPrice: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.gray900 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  qtyBtnAdd: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primaryBorder },
  qtyBtnText: { fontSize: 14, color: Colors.gray700, fontWeight: '700' },
  qtyNumber: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900, minWidth: 20, textAlign: 'center' },
  couponSection: { padding: Spacing[4], gap: Spacing[3] },
  couponRow: { flexDirection: 'row', gap: Spacing[2] },
  couponInput: {
    flex: 1, height: 46, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.lg, paddingHorizontal: Spacing[3],
    fontSize: Typography.base, color: Colors.gray900, backgroundColor: Colors.gray50,
    letterSpacing: 1,
  },
  couponApplyBtn: {
    paddingHorizontal: Spacing[4], height: 46, borderRadius: Radius.lg,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primaryBorder,
  },
  couponApplyText: { color: Colors.primary, fontWeight: Typography.semibold },
  couponMsg: { fontSize: Typography.sm, fontWeight: Typography.medium },
  couponApplied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primaryMuted, borderRadius: Radius.lg, padding: Spacing[3] },
  couponAppliedLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  couponAppliedIcon: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  couponAppliedCode: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary },
  couponAppliedSavings: { fontSize: Typography.xs, color: Colors.primary },
  couponRemove: { fontSize: Typography.sm, color: Colors.error, fontWeight: Typography.medium },
  summarySection: { padding: Spacing[4], gap: Spacing[3] },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: Typography.sm, color: Colors.gray500 },
  summaryValue: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray900 },
  freeDeliveryHint: { fontSize: Typography.xs, color: Colors.warning, fontWeight: Typography.medium },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing[3], marginTop: Spacing[1] },
  totalLabel: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.gray900 },
  totalValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.gray900 },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
  checkoutTotal: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.gray900 },
  checkoutItems: { fontSize: Typography.xs, color: Colors.gray400 },
});
