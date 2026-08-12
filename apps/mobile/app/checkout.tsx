import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../lib/store/cart';
import { useAddresses } from '../lib/hooks/useOrders';
import { Button } from '../components/ui/Button';
import { Colors, Spacing, Typography, Radius } from '../lib/theme';
import { api } from '../lib/api';

type Step = 'address' | 'review' | 'confirm';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const { items, subtotal, total, couponCode, couponDiscount, clearCart } = useCartStore();
  const { data: addresses = [], isLoading: loadingAddresses } = useAddresses();

  const sub = subtotal();
  const tot = total();
  const delivery = sub >= 499 ? 0 : 49;
  const selectedAddress = addresses.find((a: any) => a.id === selectedAddressId);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Select Address', 'Please select a delivery address');
      return;
    }
    setPlacing(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        couponCode: couponCode || undefined,
      };
      const res = await api.post('/api/v1/orders', payload);
      const orderId = res.data?.data?.id;
      clearCart();
      router.replace(`/order/${orderId}`);
    } catch (err: any) {
      Alert.alert('Order Failed', err.response?.data?.error?.message ?? 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  const steps = ['address', 'review', 'confirm'] as const;
  const stepIndex = steps.indexOf(step);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { if (stepIndex === 0) router.back(); else setStep(steps[stepIndex - 1]); }}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, stepIndex >= i && styles.stepDotActive]}>
                {stepIndex > i ? <Text style={styles.stepCheck}>✓</Text> : <Text style={styles.stepNum}>{i + 1}</Text>}
              </View>
              <Text style={[styles.stepLabel, stepIndex >= i && styles.stepLabelActive]}>
                {s === 'address' ? 'Address' : s === 'review' ? 'Review' : 'Confirm'}
              </Text>
            </View>
            {i < steps.length - 1 && <View style={[styles.stepLine, stepIndex > i && styles.stepLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing[4], gap: Spacing[4], paddingBottom: 120 }}>
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
                        <Text style={styles.addressType}>{addr.type ?? 'Home'}</Text>
                        {addr.isDefault && <Text style={styles.defaultTag}>Default</Text>}
                      </View>
                      <Text style={styles.addressName}>{addr.fullName}</Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {[addr.addressLine1, addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
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
                <View key={item.productId} style={styles.reviewItem}>
                  <View style={styles.reviewItemLeft}>
                    <Text style={styles.reviewItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.reviewItemQty}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.reviewItemPrice}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</Text>
                </View>
              ))}
            </View>

            {selectedAddress && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivering To</Text>
                <Text style={styles.addressName}>{selectedAddress.fullName}</Text>
                <Text style={styles.addressText}>
                  {[selectedAddress.addressLine1, selectedAddress.city, selectedAddress.state, selectedAddress.pincode].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Breakdown</Text>
              <View style={styles.priceRow}><Text style={styles.priceLabel}>Subtotal</Text><Text style={styles.priceValue}>₹{sub.toLocaleString('en-IN')}</Text></View>
              <View style={styles.priceRow}><Text style={styles.priceLabel}>Delivery</Text><Text style={styles.priceValue}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</Text></View>
              {couponDiscount > 0 && <View style={styles.priceRow}><Text style={[styles.priceLabel, { color: Colors.success }]}>Coupon</Text><Text style={[styles.priceValue, { color: Colors.success }]}>−₹{couponDiscount}</Text></View>}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{tot.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <View style={styles.section}>
            <View style={styles.confirmIcon}><Text style={{ fontSize: 48 }}>✅</Text></View>
            <Text style={styles.confirmTitle}>Confirm Your Order</Text>
            <Text style={styles.confirmSub}>
              You are about to place an order for ₹{tot.toLocaleString('en-IN')}.{'\n'}
              Payment will be collected on delivery.
            </Text>
            <View style={[styles.priceRow, styles.totalRow, { marginTop: Spacing[4] }]}>
              <Text style={styles.totalLabel}>Total to Pay</Text>
              <Text style={styles.totalValue}>₹{tot.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[3] }]}>
        {step !== 'confirm' && (
          <Text style={styles.totalPreview}>₹{tot.toLocaleString('en-IN')}</Text>
        )}
        <Button
          fullWidth={step === 'confirm'}
          size="lg"
          loading={placing}
          disabled={step === 'address' && !selectedAddressId}
          onPress={() => {
            if (step === 'address') setStep('review');
            else if (step === 'review') setStep('confirm');
            else handlePlaceOrder();
          }}
          style={step !== 'confirm' ? { flex: 1 } as any : undefined}
        >
          {step === 'address' ? 'Continue to Review' : step === 'review' ? 'Continue to Confirm' : 'Place Order'}
        </Button>
      </View>
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
  backText: { fontSize: 22, color: Colors.gray800, width: 36 },
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
  stepCheck: { fontSize: 12, fontWeight: Typography.bold, color: Colors.white },
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
  confirmIcon: { alignItems: 'center', paddingVertical: Spacing[4] },
  confirmTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.gray900, textAlign: 'center' },
  confirmSub: { fontSize: Typography.sm, color: Colors.gray500, textAlign: 'center', lineHeight: 22 },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[4],
    paddingHorizontal: Spacing[5], paddingTop: Spacing[4],
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  totalPreview: { fontSize: Typography.xl, fontWeight: Typography.extrabold, color: Colors.gray900 },
});
