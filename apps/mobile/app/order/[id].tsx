import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const STATUS_CONFIG: Record<string, { label: string; icon: string; bg: string; text: string }> = {
  PLACED:           { label: 'Order Placed',      icon: '📋', bg: '#fef3c7', text: '#92400e' },
  PAYMENT_CONFIRMED:{ label: 'Payment Confirmed',  icon: '💳', bg: '#dbeafe', text: '#1e40af' },
  PROCESSING:       { label: 'Processing',         icon: '⚙️', bg: '#dbeafe', text: '#1e40af' },
  PACKED:           { label: 'Packed',             icon: '📦', bg: '#e0e7ff', text: '#4338ca' },
  SHIPPED:          { label: 'Shipped',            icon: '🚚', bg: '#ede9fe', text: '#6d28d9' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   icon: '🏍️', bg: '#d1fae5', text: '#065f46' },
  DELIVERED:        { label: 'Delivered',          icon: '✅', bg: '#dcfce7', text: '#166534' },
  CANCELLED:        { label: 'Cancelled',          icon: '❌', bg: '#fee2e2', text: '#991b1b' },
};

const STEPS = ['PLACED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/api/v1/orders/${id}`)
      .then((r: any) => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await api.post(`/api/v1/orders/${id}/cancel`);
      setOrder(res.data.data);
    } catch {}
    setCancelling(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#16a34a" size="large" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a' }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#16a34a', fontWeight: '600' }}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, icon: '📦', bg: '#f3f4f6', text: '#374151' };
  const stepIndex = STEPS.indexOf(order.status);
  const canCancel = ['PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING'].includes(order.status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: '#374151', marginRight: 12 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#0a0a0a' }}>{order.orderNumber}</Text>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: statusCfg.bg }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: statusCfg.text }}>{statusCfg.icon} {statusCfg.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {/* Progress tracker */}
        {!['CANCELLED', 'RETURNED', 'REFUNDED'].includes(order.status) && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0a0a0a', marginBottom: 14 }}>Order Progress</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {STEPS.map((step, i) => {
                const done = i <= stepIndex;
                return (
                  <View key={step} style={{ flex: 1, alignItems: 'center', flexDirection: i < STEPS.length - 1 ? undefined : undefined }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10,
                        backgroundColor: done ? '#16a34a' : '#e5e7eb',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        {done && <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text>}
                      </View>
                      {i < STEPS.length - 1 && (
                        <View style={{ flex: 1, height: 2, backgroundColor: done && i < stepIndex ? '#16a34a' : '#e5e7eb' }} />
                      )}
                    </View>
                    <Text style={{ fontSize: 8, color: done ? '#16a34a' : '#9ca3af', fontWeight: '600', marginTop: 4, textAlign: 'center' }}>
                      {STATUS_CONFIG[step]?.label?.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0a0a0a', marginBottom: 12 }}>
            Items ({order.items?.length || 0})
          </Text>
          {(order.items || []).map((item: any) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
              <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ fontSize: 22, color: '#d1d5db' }}>🌿</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '600', color: '#0a0a0a' }}>{item.productName}</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>Qty: {item.quantity}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0a0a0a' }}>₹{item.totalPrice?.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        {/* Price summary */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0a0a0a', marginBottom: 12 }}>Payment Summary</Text>
          {[
            { label: 'Subtotal', value: `₹${order.subtotal?.toLocaleString('en-IN')}` },
            { label: 'Shipping', value: 'FREE' },
            { label: 'Discount', value: order.discountAmount > 0 ? `-₹${order.discountAmount?.toLocaleString('en-IN')}` : '—' },
          ].map(row => (
            <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>{row.label}</Text>
              <Text style={{ fontSize: 13, color: row.label === 'Shipping' ? '#16a34a' : '#0a0a0a', fontWeight: '500' }}>{row.value}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6', marginTop: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0a0a0a' }}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0a0a0a' }}>₹{order.finalAmount?.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Tracking */}
        {order.trackingNumber && (
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>Tracking</Text>
            <Text style={{ fontSize: 13, color: '#6b7280' }}>
              {order.courierName && `${order.courierName}: `}{order.trackingNumber}
            </Text>
          </View>
        )}

        {/* Cancel */}
        {canCancel && (
          <TouchableOpacity
            onPress={cancelOrder}
            disabled={cancelling}
            style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#fecaca' }}
          >
            {cancelling ? <ActivityIndicator color="#ef4444" /> : (
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#ef4444' }}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
