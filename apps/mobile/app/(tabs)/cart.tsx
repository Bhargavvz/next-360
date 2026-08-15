import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable, Alert, TextInput, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import {
  Lock, ShoppingBag, Leaf, Trash2, Minus, Plus, Tag, X, AlertCircle,
} from 'lucide-react-native';
import { useCartStore } from '../../lib/store/cart';
import { useAuthStore } from '../../lib/auth';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Price, formatInr } from '../../components/ui/Price';

export default function CartScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();

  const {
    items, coupon, loading, shippingAmount, freeDeliveryRemaining, hasStockIssues,
    subtotal, total, totalItems, hydrate, updateQuantity, removeItem, applyCoupon, clearCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // The cart lives on the server — refresh whenever this tab comes into view so
  // prices, stock and delivery fees are never stale.
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) void hydrate();
    }, [isAuthenticated, hydrate])
  );

  const changeQty = async (productId: string, qty: number) => {
    try {
      await updateQuantity(productId, qty);
    } catch (err: any) {
      Alert.alert('Cannot update quantity', err.message);
    }
  };

  const handleCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    const result = await applyCoupon(couponInput.trim().toUpperCase());
    setCouponMsg({ ok: result.success, text: result.message });
    if (result.success) setCouponInput('');
    setCouponBusy(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Header title="Cart" />
        <EmptyState
          icon={<Lock size={26} color={colors.primary} />}
          title="Sign in to see your cart"
          subtitle="Your cart is saved to your account, so it follows you between devices."
          action={{ label: 'Sign in', onPress: () => router.push('/(auth)/login') }}
        />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <Header title="Cart" />
        <EmptyState
          icon={<ShoppingBag size={26} color={colors.primary} />}
          title="Your cart is empty"
          subtitle="Start with the products carrying a verified NPOP certificate."
          action={{ label: 'Shop verified organic', onPress: () => router.push('/(tabs)/discover') }}
        />
      </View>
    );
  }

  const sub = subtotal();
  const tot = total();
  const discount = coupon?.discountAmount ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <Header title="Cart" subtitle={`${totalItems()} ${totalItems() === 1 ? 'item' : 'items'}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], gap: Spacing[4], paddingBottom: 180 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={hydrate} tintColor={colors.primary} />
        }
      >
        {/* Items */}
        <View style={{ gap: Spacing[3] }}>
          {items.map((item) => {
            const overStock = item.quantity > item.stock;
            return (
              <Card key={item.id} padding="sm" style={{ flexDirection: 'row', gap: Spacing[3] }}>
                <Pressable
                  onPress={() => router.push(`/product/${item.productId}`)}
                  style={{
                    width: 78,
                    height: 78,
                    borderRadius: Radius.md,
                    overflow: 'hidden',
                    backgroundColor: colors.surfaceSunken,
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Leaf size={22} color={colors.borderStrong} strokeWidth={1.25} />
                    </View>
                  )}
                </Pressable>

                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', gap: Spacing[2] }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="label" numberOfLines={2}>
                        {item.name}
                      </Text>
                      {item.variantLabel && (
                        <Text variant="caption" tone="subtle">
                          {item.variantLabel}
                        </Text>
                      )}
                    </View>
                    <Pressable
                      onPress={() => removeItem(item.productId)}
                      hitSlop={8}
                      accessibilityLabel={`Remove ${item.name}`}
                    >
                      <Trash2 size={17} color={colors.textSubtle} />
                    </Pressable>
                  </View>

                  {overStock && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={12} color={colors.warning} />
                      <Text variant="caption" style={{ color: colors.warning }}>
                        Only {item.stock} left
                      </Text>
                    </View>
                  )}

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: Spacing[2],
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: Radius.md,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Pressable
                        onPress={() => changeQty(item.productId, item.quantity - 1)}
                        style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}
                        accessibilityLabel="Decrease quantity"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={14} color={colors.textSecondary} />
                        ) : (
                          <Minus size={14} color={colors.textSecondary} />
                        )}
                      </Pressable>
                      <Text variant="label" style={{ width: 26, textAlign: 'center' }}>
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => changeQty(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}
                        accessibilityLabel="Increase quantity"
                      >
                        <Plus
                          size={14}
                          color={item.quantity >= item.stock ? colors.textSubtle : colors.textSecondary}
                        />
                      </Pressable>
                    </View>

                    <Price value={item.price * item.quantity} size="md" />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Coupon */}
        <Card padding="md" style={{ gap: Spacing[3] }}>
          <Text variant="eyebrow" tone="subtle">
            Coupon
          </Text>

          {coupon ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: Spacing[2.5],
                paddingHorizontal: Spacing[3],
                borderRadius: Radius.md,
                backgroundColor: colors.successMuted,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
                <Tag size={15} color={colors.success} />
                <View>
                  <Text variant="label" tone="success">
                    {coupon.code}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    You save ₹{formatInr(discount)}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  clearCoupon();
                  setCouponMsg(null);
                }}
                hitSlop={8}
                accessibilityLabel="Remove coupon"
              >
                <X size={16} color={colors.textSubtle} />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: Spacing[2] }}>
                <TextInput
                  value={couponInput}
                  onChangeText={(v) => {
                    setCouponInput(v.toUpperCase());
                    setCouponMsg(null);
                  }}
                  placeholder="Enter code"
                  placeholderTextColor={colors.textSubtle}
                  autoCapitalize="characters"
                  style={{
                    flex: 1,
                    height: 44,
                    paddingHorizontal: Spacing[3.5],
                    borderRadius: Radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceSunken,
                    color: colors.text,
                    fontSize: 15,
                  }}
                />
                <Button size="sm" variant="secondary" loading={couponBusy} onPress={handleCoupon}>
                  Apply
                </Button>
              </View>
              {couponMsg && (
                <Text variant="caption" tone={couponMsg.ok ? 'success' : 'error'}>
                  {couponMsg.text}
                </Text>
              )}
            </>
          )}
        </Card>

        {/* Summary */}
        <Card padding="md" style={{ gap: Spacing[2.5] }}>
          <Text variant="eyebrow" tone="subtle">
            Summary
          </Text>
          <Row label="Subtotal" value={`₹${formatInr(sub)}`} />
          <Row
            label="Delivery"
            value={shippingAmount > 0 ? `₹${formatInr(shippingAmount)}` : 'FREE'}
            valueTone={shippingAmount > 0 ? 'default' : 'success'}
          />
          {discount > 0 && (
            <Row label="Coupon discount" value={`−₹${formatInr(discount)}`} valueTone="success" />
          )}

          {freeDeliveryRemaining > 0 && (
            <View
              style={{
                paddingVertical: Spacing[2],
                paddingHorizontal: Spacing[3],
                borderRadius: Radius.sm,
                backgroundColor: colors.primaryMuted,
              }}
            >
              <Text variant="caption" tone="primary">
                Add ₹{formatInr(freeDeliveryRemaining)} more for free delivery
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: Spacing[3],
              marginTop: Spacing[1],
            }}
          >
            <Text variant="title">Total</Text>
            <Text variant="display" style={{ fontSize: 24 }}>
              ₹{formatInr(tot)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Checkout bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing[4],
          paddingHorizontal: Spacing[5],
          paddingTop: Spacing[4],
          paddingBottom: Spacing[4],
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View>
          <Text variant="caption" tone="subtle">
            Total
          </Text>
          <Text variant="displaySm">₹{formatInr(tot)}</Text>
        </View>
        <Button
          size="lg"
          style={{ flex: 1 }}
          disabled={hasStockIssues}
          onPress={() => router.push('/checkout')}
        >
          {hasStockIssues ? 'Fix stock issues' : 'Checkout'}
        </Button>
      </View>
    </View>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
      <Text variant="display" style={{ fontSize: 28 }}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="caption" tone="subtle">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

function Row({
  label,
  value,
  valueTone = 'default',
}: {
  label: string;
  value: string;
  valueTone?: 'default' | 'success';
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="body" tone="secondary">
        {label}
      </Text>
      <Text variant="bodyMedium" tone={valueTone === 'success' ? 'success' : 'default'}>
        {value}
      </Text>
    </View>
  );
}
