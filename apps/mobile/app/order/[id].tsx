import React, { useState } from 'react';
import { View, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import {
  ArrowLeft, Check, X, Truck, Package, MapPin, CreditCard, Leaf, AlertCircle,
} from 'lucide-react-native';
import { useOrder } from '../../lib/hooks/useOrders';
import { api, apiErrorMessage } from '../../lib/api';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatInr } from '../../components/ui/Price';
import { PaymentSheet, type PaymentInit, type PaymentResult } from '../../components/PaymentSheet';

/**
 * The fulfilment timeline, using the statuses the API actually emits.
 *
 * The previous list (`PENDING`, `CONFIRMED`) never matched anything the server
 * returns, so the timeline sat permanently at step -1 and the cancel button
 * never appeared.
 */
const TIMELINE = [
  { status: 'PLACED', label: 'Placed', Icon: Check },
  { status: 'PAYMENT_CONFIRMED', label: 'Confirmed', Icon: CreditCard },
  { status: 'PROCESSING', label: 'Packed', Icon: Package },
  { status: 'SHIPPED', label: 'Shipped', Icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', Icon: Check },
] as const;

/** Statuses that map onto a timeline position, including ones we don't show. */
const PROGRESS: Record<string, number> = {
  PLACED: 0,
  PAYMENT_CONFIRMED: 1,
  PROCESSING: 2,
  PACKED: 2,
  SHIPPED: 3,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
};

const TERMINAL = ['CANCELLED', 'RETURNED', 'REFUNDED'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useScreenInsets();
  const { colors } = useTheme();

  const { data: order, isLoading, refetch } = useOrder(id);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentInit, setPaymentInit] = useState<PaymentInit | null>(null);

  if (isLoading || !order) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ padding: Spacing[5], gap: Spacing[3] }}>
          <Skeleton style={{ height: 24, width: '50%' }} />
          <Skeleton style={{ height: 110, borderRadius: Radius.xl }} />
          <Skeleton style={{ height: 160, borderRadius: Radius.xl }} />
          <Skeleton style={{ height: 120, borderRadius: Radius.xl }} />
        </View>
      </View>
    );
  }

  const cancelled = TERMINAL.includes(order.status);
  const step = PROGRESS[order.status] ?? 0;
  const canCancel = order.status === 'PLACED' || order.status === 'PAYMENT_CONFIRMED';
  // COD settles on delivery, so only online orders can be paid from here.
  const needsPayment =
    !cancelled &&
    order.paymentMethod !== 'COD' &&
    order.paymentStatus !== 'COMPLETED' &&
    order.paymentStatus !== 'REFUNDED';

  const confirmCancel = () =>
    Alert.alert('Cancel this order?', 'The items go back on sale and any payment is refunded.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await api.post(`/api/v1/orders/${id}/cancel`);
            await refetch();
          } catch (err) {
            Alert.alert('Could not cancel', apiErrorMessage(err, 'Please try again.'));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);

  const startPayment = async () => {
    setPaying(true);
    try {
      const res = await api.post(`/api/v1/payments/initiate/${id}`, { method: 'RAZORPAY' });
      setPaymentInit(res.data.data as PaymentInit);
    } catch (err) {
      Alert.alert('Could not start payment', apiErrorMessage(err, 'Please try again.'));
    } finally {
      setPaying(false);
    }
  };

  const handlePaymentResult = async (result: PaymentResult) => {
    const init = paymentInit;
    setPaymentInit(null);
    if (!init) return;

    if (result.status === 'success') {
      try {
        await api.post('/api/v1/payments/verify', {
          orderId: init.orderId,
          gatewayPaymentId: result.paymentId,
          gatewayOrderId: result.orderId,
          gatewaySignature: result.signature,
        });
      } catch (err) {
        Alert.alert('Payment not confirmed', apiErrorMessage(err, 'Please check your orders.'));
      }
      await refetch();
      return;
    }

    const reason =
      result.status === 'dismissed' ? 'Payment cancelled by the customer' : result.reason;
    await api
      .post('/api/v1/payments/failed', {
        orderId: init.orderId,
        gatewayOrderId: init.gatewayOrderId,
        reason,
      })
      .catch(() => {});
    if (result.status === 'failed') Alert.alert('Payment failed', reason);
    await refetch();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing[5],
          paddingVertical: Spacing[3],
        }}
      >
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/orders'))}
          hitSlop={10}
          accessibilityLabel="Go back"
          style={{
            width: 38,
            height: 38,
            borderRadius: Radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceSunken,
          }}
        >
          <ArrowLeft size={18} color={colors.textSecondary} />
        </Pressable>
        <Text variant="displaySm" style={{ flex: 1, textAlign: 'center' }}>
          Order
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], gap: Spacing[4], paddingBottom: Spacing[12] }}
      >
        {/* Identity */}
        <View>
          <Text variant="display" style={{ fontSize: 24 }}>
            {order.orderNumber}
          </Text>
          <Text variant="caption" tone="subtle" style={{ marginTop: 2 }}>
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Unpaid online order */}
        {needsPayment && (
          <Card variant="seal" padding="md" style={{ gap: Spacing[3] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
              <AlertCircle size={16} color={colors.seal} />
              <Text variant="bodyMedium" tone="seal">
                Payment pending
              </Text>
            </View>
            <Text variant="caption" tone="secondary">
              {order.paymentStatus === 'FAILED'
                ? 'Your last attempt did not go through. The order is still reserved.'
                : 'This order has not been paid for yet.'}
            </Text>
            <Button size="md" variant="seal" loading={paying} onPress={startPayment} fullWidth>
              Pay ₹{formatInr(order.finalAmount ?? 0)}
            </Button>
          </Card>
        )}

        {/* Timeline */}
        {cancelled ? (
          <Card padding="md" style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: Radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.errorMuted,
              }}
            >
              <X size={17} color={colors.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">
                {order.status.charAt(0) + order.status.slice(1).toLowerCase().replace(/_/g, ' ')}
              </Text>
              <Text variant="caption" tone="secondary">
                This order is closed.
              </Text>
            </View>
          </Card>
        ) : (
          <Card padding="md">
            {TIMELINE.map((node, i) => {
              const done = i <= step;
              const current = i === step;
              const last = i === TIMELINE.length - 1;
              return (
                <View key={node.status} style={{ flexDirection: 'row', gap: Spacing[3] }}>
                  {/* Rail */}
                  <View style={{ alignItems: 'center', width: 28 }}>
                    <View
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: Radius.full,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: done ? colors.primary : colors.surfaceSunken,
                        borderWidth: current ? 3 : 0,
                        borderColor: colors.primaryMuted,
                      }}
                    >
                      <node.Icon
                        size={13}
                        color={done ? colors.primaryOn : colors.textSubtle}
                        strokeWidth={2.5}
                      />
                    </View>
                    {!last && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 26,
                          backgroundColor: i < step ? colors.primary : colors.border,
                        }}
                      />
                    )}
                  </View>

                  <View style={{ flex: 1, paddingBottom: last ? 0 : Spacing[4] }}>
                    <Text variant={current ? 'bodyMedium' : 'body'} tone={done ? 'default' : 'subtle'}>
                      {node.label}
                    </Text>
                    {current && (
                      <Text variant="caption" tone="primary">
                        Current status
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </Card>
        )}

        {/* Items */}
        <Card padding="md" style={{ gap: Spacing[3] }}>
          <Text variant="eyebrow" tone="subtle">
            {order.items?.length ?? 0} {order.items?.length === 1 ? 'item' : 'items'}
          </Text>
          {(order.items ?? []).map((item: any) => (
            <View key={item.id} style={{ flexDirection: 'row', gap: Spacing[3] }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: Radius.md,
                  overflow: 'hidden',
                  backgroundColor: colors.surfaceSunken,
                }}
              >
                {item.productImageUrl ? (
                  <Image
                    source={{ uri: item.productImageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Leaf size={18} color={colors.borderStrong} strokeWidth={1.25} />
                  </View>
                )}
              </View>

              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text variant="label" numberOfLines={2}>
                  {item.productName}
                </Text>
                <Text variant="caption" tone="subtle">
                  Qty {item.quantity}
                  {item.sellerName ? ` · ${item.sellerName}` : ''}
                </Text>
              </View>

              <Text variant="bodyMedium" style={{ alignSelf: 'center' }}>
                ₹{formatInr(item.totalPrice ?? 0)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Delivery */}
        {order.shippingAddress && (
          <Card padding="md" style={{ gap: Spacing[1] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color={colors.textSubtle} />
              <Text variant="eyebrow" tone="subtle">
                Delivering to
              </Text>
            </View>
            <Text variant="bodyMedium">{order.shippingAddress.name}</Text>
            <Text variant="caption" tone="secondary">
              {[
                order.shippingAddress.addressLine1,
                order.shippingAddress.city,
                order.shippingAddress.state,
                order.shippingAddress.pincode,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
            <Text variant="caption" tone="subtle">
              {order.shippingAddress.phone}
            </Text>
          </Card>
        )}

        {/* Payment summary */}
        <Card padding="md" style={{ gap: Spacing[2.5] }}>
          <Text variant="eyebrow" tone="subtle">
            Payment
          </Text>
          <Row label="Subtotal" value={`₹${formatInr(order.totalAmount ?? 0)}`} />
          {order.discountAmount > 0 && (
            <Row label="Discount" value={`−₹${formatInr(order.discountAmount)}`} success />
          )}
          <Row
            label="Delivery"
            value={order.shippingAmount > 0 ? `₹${formatInr(order.shippingAmount)}` : 'FREE'}
            success={!order.shippingAmount}
          />
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
            <Text variant="display" style={{ fontSize: 22 }}>
              ₹{formatInr(order.finalAmount ?? 0)}
            </Text>
          </View>
          <Text variant="caption" tone="subtle">
            {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid online'} ·{' '}
            {order.paymentStatus?.toLowerCase()}
          </Text>
        </Card>

        {canCancel && (
          <Button variant="ghost" fullWidth loading={cancelling} onPress={confirmCancel}>
            <Text variant="bodyMedium" tone="error">
              Cancel this order
            </Text>
          </Button>
        )}
      </ScrollView>

      <PaymentSheet visible={!!paymentInit} init={paymentInit} onResult={handlePaymentResult} />
    </View>
  );
}

function Row({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="body" tone="secondary">
        {label}
      </Text>
      <Text variant="bodyMedium" tone={success ? 'success' : 'default'}>
        {value}
      </Text>
    </View>
  );
}
