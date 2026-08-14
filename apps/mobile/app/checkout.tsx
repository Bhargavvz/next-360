import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../lib/store/cart';
import { useAddresses } from '../lib/hooks/useOrders';
import { Button } from '../components/ui/Button';
import { PaymentSheet, type PaymentInit, type PaymentResult } from '../components/PaymentSheet';
import { Colors, Spacing, Typography, Radius } from '../lib/theme';
import { api, apiErrorMessage } from '../lib/api';
import { ArrowLeft, Check, CreditCard, Banknote } from 'lucide-react-native';

type Step = 'address' | 'review' | 'payment';
type PaymentMethod = 'RAZORPAY' | 'COD';

const STEPS: Step[] = ['address', 'review', 'payment'];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY');
  const [placing, setPlacing] = useState(false);
  const [paymentInit, setPaymentInit] = useState<PaymentInit | null>(null);

  const { items, coupon, subtotal, total, shippingAmount, hydrate, clearCart } = useCartStore();
  const { data: addresses = [], isLoading: loadingAddresses } = useAddresses();

  const sub = subtotal();
  const tot = total();
  const delivery = shippingAmount;
  const couponDiscount = coupon?.discountAmount ?? 0;
  const selectedAddress = addresses.find((a: any) => a.id === selectedAddressId);
  const stepIndex = STEPS.indexOf(step);

  // Make sure prices and stock are current before the buyer commits.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Preselect the default address, or the only one available.
  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    const preferred = addresses.find((a: any) => a.isDefault) ?? addresses[0];
    setSelectedAddressId(preferred.id);
  }, [addresses, selectedAddressId]);

  const formatInr = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  /** Create the order, then either finish (COD) or open the gateway sheet. */
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Select Address', 'Please choose a delivery address');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Add something to your cart before checking out');
      return;
    }

    setPlacing(true);
    let orderId: string | undefined;

    try {
      const orderRes = await api.post('/api/v1/orders', {
        shippingAddressId: selectedAddressId,
        couponCode: coupon?.code ?? null,
        deliveryNotes: '',
        paymentMethod,
      });
      orderId = orderRes.data?.data?.id;
      if (!orderId) throw new Error('Order could not be created');

      const initRes = await api.post(`/api/v1/payments/initiate/${orderId}`, { method: paymentMethod });
      const init = initRes.data.data as PaymentInit;

      if (paymentMethod === 'COD') {
        await clearCart();
        router.replace(`/order/${orderId}`);
        return;
      }

      // Hand off to the WebView checkout; the result comes back via onResult.
      setPaymentInit(init);
    } catch (err) {
      Alert.alert('Checkout failed', apiErrorMessage(err, 'Could not place your order. Please try again.'));
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
        // The gateway callback alone is not proof — the server verifies the signature.
        await api.post('/api/v1/payments/verify', {
          orderId: init.orderId,
          gatewayPaymentId: result.paymentId,
          gatewayOrderId: result.orderId,
          gatewaySignature: result.signature,
        });
        await clearCart();
        router.replace(`/order/${init.orderId}`);
      } catch (err) {
        Alert.alert(
          'Payment not confirmed',
          apiErrorMessage(err, 'We could not confirm your payment. Check your orders before retrying.')
        );
        router.replace(`/order/${init.orderId}`);
      }
      return;
    }

    const reason = result.status === 'dismissed'
      ? 'Payment cancelled by the customer'
      : result.reason;

    // Best-effort: stop the pending payment from lingering.
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
    step === 'address' ? 'Continue to Review'
      : step === 'review' ? 'Continue to Payment'
        : paymentMethod === 'COD' ? 'Place Order' : `Pay ₹${formatInr(tot)}`;

  const primaryDisabled =
    (step === 'address' && !selectedAddressId) || items.length === 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (stepIndex === 0 ? router.back() : setStep(STEPS[stepIndex - 1]))}
        >
          <View style={{ width: 36, alignItems: 'center' }}>
            <ArrowLeft size={22} color={Colors.gray800} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, stepIndex >= i && styles.stepDotActive]}>
                {stepIndex > i ? <Check size={12} color={Colors.white} /> : <Text style={styles.stepNum}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepLabel, stepIndex >= i && styles.stepLabelActive]}>
                {s === 'address' ? 'Address' : s === 'review' ? 'Review' : 'Payment'}
              </Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, stepIndex > i && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[4], gap: Spacing[4], paddingBottom: 120 }}
      >
        {/* Step 1: Address */}
        {step === 'address' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Delivery Address</Text>
            {loadingAddresses ? (
              <ActivityIndicator color={Colors.primary} />
            ) : addresses.length === 0 ? (
              <View style={styles.noAddress}>
                <Text style={styles.noAddressText}>No saved addresses</Text>
                <TouchableOpacity style={styles.addAddressBtn} onPress={() => router.push('/address/new')}>
                  <Text style={styles.addAddressText}>+ Add New Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {addresses.map((addr: any) => (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addressCard, selectedAddressId === addr.id && styles.addressCardSelected]}
                    onPress={() => setSelectedAddressId(addr.id)}
                  >
                    <View style={styles.addressRadio}>
                      <View style={[styles.radioDot, selectedAddressId === addr.id && styles.radioDotActive]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.addressTagRow}>
                        <Text style={styles.addressType}>{addr.type ?? 'HOME'}</Text>
                        {addr.isDefault && <Text style={styles.defaultTag}>Default</Text>}
                      </View>
                      <Text style={styles.addressName}>{addr.name}</Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {[addr.addressLine1, addr.addressLine2, addr.landmark, addr.city, addr.state, addr.pincode]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                      <Text style={styles.addressPhone}>{addr.phone}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.addAddressBtn} onPress={() => router.push('/address/new')}>
                  <Text style={styles.addAddressText}>+ Add New Address</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Step 2: Review */}
        {step === 'review' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.reviewItem}>
                  <View style={styles.reviewItemLeft}>
                    <Text style={styles.reviewItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.reviewItemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.reviewItemPrice}>₹{formatInr(item.price * item.quantity)}</Text>
                </View>
              ))}
            </View>

            {selectedAddress && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivering To</Text>
                <Text style={styles.addressName}>{selectedAddress.name}</Text>
                <Text style={styles.addressText}>
                  {[selectedAddress.addressLine1, selectedAddress.city, selectedAddress.state, selectedAddress.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Breakdown</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>₹{formatInr(sub)}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Delivery</Text>
                <Text style={styles.priceValue}>{delivery === 0 ? 'FREE' : `₹${formatInr(delivery)}`}</Text>
              </View>
              {couponDiscount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={[styles.priceLabel, { color: Colors.success }]}>Coupon ({coupon?.code})</Text>
                  <Text style={[styles.priceValue, { color: Colors.success }]}>−₹{formatInr(couponDiscount)}</Text>
                </View>
              )}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{formatInr(tot)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Step 3: Payment */}
        {step === 'payment' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              {([
                { id: 'RAZORPAY' as const, label: 'Pay online', hint: 'UPI, cards, netbanking & wallets', Icon: CreditCard },
                { id: 'COD' as const, label: 'Cash on delivery', hint: 'Pay the courier when it arrives', Icon: Banknote },
              ]).map(({ id, label, hint, Icon }) => (
                <TouchableOpacity
                  key={id}
                  style={[styles.methodCard, paymentMethod === id && styles.methodCardSelected]}
                  onPress={() => setPaymentMethod(id)}
                >
                  <View style={styles.addressRadio}>
                    <View style={[styles.radioDot, paymentMethod === id && styles.radioDotActive]} />
                  </View>
                  <Icon size={20} color={paymentMethod === id ? Colors.primary : Colors.gray600} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodLabel}>{label}</Text>
                    <Text style={styles.methodHint}>{hint}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <View style={[styles.priceRow, styles.totalRow, { borderTopWidth: 0, marginTop: 0, paddingTop: 0 }]}>
                <Text style={styles.totalLabel}>Total to pay</Text>
                <Text style={styles.totalValue}>₹{formatInr(tot)}</Text>
              </View>
              <Text style={styles.paymentNote}>
                {paymentMethod === 'COD'
                  ? 'Keep the exact amount ready at delivery.'
                  : 'Payments are processed securely by Razorpay. Next360 never sees your card details.'}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[3] }]}>
        {step !== 'payment' && <Text style={styles.totalPreview}>₹{formatInr(tot)}</Text>}
        <Button
          fullWidth={step === 'payment'}
          size="lg"
          loading={placing}
          disabled={primaryDisabled}
          onPress={() => {
            if (step === 'address') setStep('review');
            else if (step === 'review') setStep('payment');
            else void handlePlaceOrder();
          }}
          style={step !== 'payment' ? ({ flex: 1 } as any) : undefined}
        >
          {primaryLabel}
        </Button>
      </View>

      <PaymentSheet visible={!!paymentInit} init={paymentInit} onResult={handlePaymentResult} />
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
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
  stepBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing[6], paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.gray200, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: Colors.primary },
  stepNum: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.gray400 },
  stepLabel: { fontSize: Typography.xs, color: Colors.gray400 },
  stepLabelActive: { color: Colors.primary, fontWeight: Typography.semibold },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.gray200, marginHorizontal: Spacing[2] },
  stepLineActive: { backgroundColor: Colors.primary },
  section: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[4], gap: Spacing[3],
  },
  sectionTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  noAddress: { alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[4] },
  noAddressText: { fontSize: Typography.base, color: Colors.gray400 },
  addAddressBtn: {
    borderWidth: 1.5, borderColor: Colors.primaryBorder, borderRadius: Radius.lg,
    paddingVertical: Spacing[3], paddingHorizontal: Spacing[4],
    borderStyle: 'dashed', alignItems: 'center',
  },
  addAddressText: { fontSize: Typography.base, color: Colors.primary, fontWeight: Typography.semibold },
  addressCard: {
    flexDirection: 'row', gap: Spacing[3],
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.xl, padding: Spacing[4],
  },
  addressCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  addressRadio: { paddingTop: 2 },
  radioDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.gray300,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDotActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  addressTagRow: { flexDirection: 'row', gap: Spacing[2], alignItems: 'center', marginBottom: 2 },
  addressType: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.gray600, textTransform: 'uppercase', letterSpacing: 0.5 },
  defaultTag: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.medium },
  addressName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  addressText: { fontSize: Typography.sm, color: Colors.gray500, lineHeight: 20 },
  addressPhone: { fontSize: Typography.sm, color: Colors.gray400 },
  methodCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.xl, padding: Spacing[4],
  },
  methodCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  methodLabel: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  methodHint: { fontSize: Typography.xs, color: Colors.gray500 },
  paymentNote: { fontSize: Typography.xs, color: Colors.gray400, lineHeight: 18 },
  reviewItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing[2], borderBottomWidth: 1, borderBottomColor: Colors.border },
  reviewItemLeft: { flex: 1 },
  reviewItemName: { fontSize: Typography.sm, fontWeight: Typography.medium, color: Colors.gray900 },
  reviewItemQty: { fontSize: Typography.xs, color: Colors.gray400 },
  reviewItemPrice: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray900 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: Typography.sm, color: Colors.gray500 },
  priceValue: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray900 },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing[3], marginTop: Spacing[1] },
  totalLabel: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.gray900 },
  totalValue: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.gray900 },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[4],
    paddingHorizontal: Spacing[5], paddingTop: Spacing[4],
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  totalPreview: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.gray900 },
});
