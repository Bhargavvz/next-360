import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../lib/useScreenInsets';
import {
  ArrowLeft, Check, CreditCard, Banknote, MapPin, Plus, ShieldCheck,
} from 'lucide-react-native';
import { useCartStore } from '../lib/store/cart';
import { useAddresses } from '../lib/hooks/useOrders';
import { api, apiErrorMessage } from '../lib/api';
import { Radius, Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatInr } from '../components/ui/Price';
import { PaymentSheet, type PaymentInit, type PaymentResult } from '../components/PaymentSheet';

type Step = 'address' | 'review' | 'payment';
type PaymentMethod = 'RAZORPAY' | 'COD';

const STEPS: Step[] = ['address', 'review', 'payment'];
const STEP_LABEL: Record<Step, string> = {
  address: 'Address',
  review: 'Review',
  payment: 'Payment',
};

export default function CheckoutScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();

  const [step, setStep] = useState<Step>('address');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('RAZORPAY');
  const [placing, setPlacing] = useState(false);
  const [paymentInit, setPaymentInit] = useState<PaymentInit | null>(null);

  const { items, coupon, subtotal, total, shippingAmount, hydrate, clearCart } = useCartStore();
  const { data: addresses = [], isLoading: loadingAddresses } = useAddresses();

  const sub = subtotal();
  const tot = total();
  const discount = coupon?.discountAmount ?? 0;
  const selected = addresses.find((a: any) => a.id === addressId);
  const stepIndex = STEPS.indexOf(step);

  // Make sure prices and stock are current before the buyer commits.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (addressId || addresses.length === 0) return;
    const preferred = addresses.find((a: any) => a.isDefault) ?? addresses[0];
    setAddressId(preferred.id);
  }, [addresses, addressId]);

  const placeOrder = async () => {
    if (!addressId) {
      Alert.alert('Select an address', 'Choose where this order should be delivered.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Add something before checking out.');
      return;
    }

    setPlacing(true);
    try {
      const orderRes = await api.post('/api/v1/orders', {
        shippingAddressId: addressId,
        couponCode: coupon?.code ?? null,
        deliveryNotes: '',
        paymentMethod: method,
      });
      const orderId = orderRes.data?.data?.id;
      if (!orderId) throw new Error('Order could not be created');

      const initRes = await api.post(`/api/v1/payments/initiate/${orderId}`, { method });
      const init = initRes.data.data as PaymentInit;

      if (method === 'COD') {
        await clearCart();
        router.replace(`/order/${orderId}`);
        return;
      }

      // Hand off to the WebView checkout; the outcome arrives via onResult.
      setPaymentInit(init);
    } catch (err) {
      Alert.alert('Checkout failed', apiErrorMessage(err, 'Could not place your order.'));
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentResult = async (result: PaymentResult) => {
    const init = paymentInit;
    setPaymentInit(null);
    if (!init) return;

    if (result.status === 'success') {
      try {
        // The gateway callback alone is not proof — the server verifies the HMAC.
        await api.post('/api/v1/payments/verify', {
          orderId: init.orderId,
          gatewayPaymentId: result.paymentId,
          gatewayOrderId: result.orderId,
          gatewaySignature: result.signature,
        });
        await clearCart();
      } catch (err) {
        Alert.alert(
          'Payment not confirmed',
          apiErrorMessage(err, 'We could not confirm your payment. Check your orders before retrying.')
        );
      }
      router.replace(`/order/${init.orderId}`);
      return;
    }

    const reason =
      result.status === 'dismissed' ? 'Payment cancelled by the customer' : result.reason;

    // Best effort — stops the pending payment lingering.
    await api
      .post('/api/v1/payments/failed', {
        orderId: init.orderId,
        gatewayOrderId: init.gatewayOrderId,
        reason,
      })
      .catch(() => {});

    Alert.alert(
      result.status === 'dismissed' ? 'Payment cancelled' : 'Payment failed',
      result.status === 'dismissed'
        ? `Order ${init.orderNumber} is saved — you can pay for it from your orders.`
        : reason
    );
    router.replace(`/order/${init.orderId}`);
  };

  const primaryLabel =
    step === 'address'
      ? 'Continue to review'
      : step === 'review'
        ? 'Continue to payment'
        : method === 'COD'
          ? 'Place order'
          : `Pay ₹${formatInr(tot)}`;

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
          onPress={() => (stepIndex === 0 ? router.back() : setStep(STEPS[stepIndex - 1]))}
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
          Checkout
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Progress — a single filled track rather than three dots, so how far
          along you are is legible at a glance. */}
      <View style={{ paddingHorizontal: Spacing[5], paddingBottom: Spacing[4] }}>
        <View style={{ flexDirection: 'row', gap: Spacing[1.5] }}>
          {STEPS.map((s, i) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 3,
                borderRadius: Radius.full,
                backgroundColor: i <= stepIndex ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>
        <Text variant="caption" tone="subtle" style={{ marginTop: Spacing[2] }}>
          Step {stepIndex + 1} of {STEPS.length} · {STEP_LABEL[step]}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], gap: Spacing[4], paddingBottom: 160 }}
      >
        {/* ── Address ─────────────────────────────────── */}
        {step === 'address' && (
          <>
            {loadingAddresses ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing[8] }} />
            ) : addresses.length === 0 ? (
              <Card padding="lg" style={{ alignItems: 'center', gap: Spacing[3] }}>
                <MapPin size={24} color={colors.textSubtle} />
                <Text variant="bodyMedium" center>
                  No saved addresses
                </Text>
                <Text variant="caption" tone="secondary" center>
                  Add one so we know where to deliver.
                </Text>
                <Button size="md" onPress={() => router.push('/address/new')} style={{ marginTop: Spacing[2] }}>
                  Add an address
                </Button>
              </Card>
            ) : (
              <>
                {addresses.map((addr: any) => {
                  const active = addressId === addr.id;
                  return (
                    <Pressable key={addr.id} onPress={() => setAddressId(addr.id)}>
                      <Card
                        variant={active ? 'accent' : 'flat'}
                        padding="md"
                        style={{ flexDirection: 'row', gap: Spacing[3] }}
                      >
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: Radius.full,
                            borderWidth: 2,
                            borderColor: active ? colors.primary : colors.borderStrong,
                            backgroundColor: active ? colors.primary : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: 2,
                          }}
                        >
                          {active && <Check size={11} color={colors.primaryOn} strokeWidth={3.5} />}
                        </View>

                        <View style={{ flex: 1, gap: 2 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
                            <Text variant="eyebrow" tone="subtle">
                              {addr.type ?? 'HOME'}
                            </Text>
                            {addr.isDefault && (
                              <Text variant="eyebrow" tone="primary">
                                Default
                              </Text>
                            )}
                          </View>
                          <Text variant="bodyMedium">{addr.name}</Text>
                          <Text variant="caption" tone="secondary">
                            {[addr.addressLine1, addr.addressLine2, addr.landmark, addr.city, addr.state, addr.pincode]
                              .filter(Boolean)
                              .join(', ')}
                          </Text>
                          <Text variant="caption" tone="subtle">
                            {addr.phone}
                          </Text>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}

                <Pressable onPress={() => router.push('/address/new')}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: Spacing[2],
                      paddingVertical: Spacing[4],
                      borderRadius: Radius.xl,
                      borderWidth: 1.5,
                      borderStyle: 'dashed',
                      borderColor: colors.primaryBorder,
                    }}
                  >
                    <Plus size={16} color={colors.primary} />
                    <Text variant="label" tone="primary">
                      Add a new address
                    </Text>
                  </View>
                </Pressable>
              </>
            )}
          </>
        )}

        {/* ── Review ──────────────────────────────────── */}
        {step === 'review' && (
          <>
            <Card padding="md" style={{ gap: Spacing[3] }}>
              <Text variant="eyebrow" tone="subtle">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Text>
              {items.map((item) => (
                <View
                  key={item.id}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing[3] }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="label" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text variant="caption" tone="subtle">
                      Qty {item.quantity}
                    </Text>
                  </View>
                  <Text variant="bodyMedium">₹{formatInr(item.price * item.quantity)}</Text>
                </View>
              ))}
            </Card>

            {selected && (
              <Card padding="md" style={{ gap: Spacing[1] }}>
                <Text variant="eyebrow" tone="subtle">
                  Delivering to
                </Text>
                <Text variant="bodyMedium">{selected.name}</Text>
                <Text variant="caption" tone="secondary">
                  {[selected.addressLine1, selected.city, selected.state, selected.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </Card>
            )}

            <Card padding="md" style={{ gap: Spacing[2.5] }}>
              <Text variant="eyebrow" tone="subtle">
                Price breakdown
              </Text>
              <Row label="Subtotal" value={`₹${formatInr(sub)}`} />
              <Row
                label="Delivery"
                value={shippingAmount > 0 ? `₹${formatInr(shippingAmount)}` : 'FREE'}
                success={shippingAmount === 0}
              />
              {discount > 0 && (
                <Row label={`Coupon (${coupon?.code})`} value={`−₹${formatInr(discount)}`} success />
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
                <Text variant="display" style={{ fontSize: 23 }}>
                  ₹{formatInr(tot)}
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* ── Payment ─────────────────────────────────── */}
        {step === 'payment' && (
          <>
            {(
              [
                {
                  id: 'RAZORPAY' as const,
                  label: 'Pay online',
                  hint: 'UPI, cards, netbanking & wallets',
                  Icon: CreditCard,
                },
                {
                  id: 'COD' as const,
                  label: 'Cash on delivery',
                  hint: 'Pay the courier when it arrives',
                  Icon: Banknote,
                },
              ]
            ).map(({ id, label, hint, Icon }) => {
              const active = method === id;
              return (
                <Pressable key={id} onPress={() => setMethod(id)}>
                  <Card
                    variant={active ? 'accent' : 'flat'}
                    padding="md"
                    style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: Radius.full,
                        borderWidth: 2,
                        borderColor: active ? colors.primary : colors.borderStrong,
                        backgroundColor: active ? colors.primary : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active && <Check size={11} color={colors.primaryOn} strokeWidth={3.5} />}
                    </View>
                    <Icon size={20} color={active ? colors.primary : colors.textSecondary} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{label}</Text>
                      <Text variant="caption" tone="secondary">
                        {hint}
                      </Text>
                    </View>
                  </Card>
                </Pressable>
              );
            })}

            <Card variant="sunken" padding="md" style={{ gap: Spacing[2] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text variant="title">Total to pay</Text>
                <Text variant="display" style={{ fontSize: 23 }}>
                  ₹{formatInr(tot)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={13} color={colors.success} />
                <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
                  {method === 'COD'
                    ? 'Keep the exact amount ready at delivery.'
                    : 'Processed securely by Razorpay. Next360 never sees your card details.'}
                </Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>

      {/* Bottom bar */}
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
          paddingBottom: insets.bottom + Spacing[2],
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        {step !== 'payment' && (
          <View>
            <Text variant="caption" tone="subtle">
              Total
            </Text>
            <Text variant="displaySm">₹{formatInr(tot)}</Text>
          </View>
        )}
        <Button
          size="lg"
          style={{ flex: 1 }}
          loading={placing}
          disabled={(step === 'address' && !addressId) || items.length === 0}
          onPress={() => {
            if (step === 'address') setStep('review');
            else if (step === 'review') setStep('payment');
            else void placeOrder();
          }}
        >
          {primaryLabel}
        </Button>
      </View>

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
