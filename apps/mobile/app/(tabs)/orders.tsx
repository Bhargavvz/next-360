import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PLACED:          { bg: '#fef3c7', text: '#92400e' },
  PAYMENT_CONFIRMED:{ bg: '#dbeafe', text: '#1e40af' },
  PROCESSING:      { bg: '#dbeafe', text: '#1e40af' },
  PACKED:          { bg: '#e0e7ff', text: '#4338ca' },
  SHIPPED:         { bg: '#ede9fe', text: '#6d28d9' },
  OUT_FOR_DELIVERY:{ bg: '#d1fae5', text: '#065f46' },
  DELIVERED:       { bg: '#dcfce7', text: '#166534' },
  CANCELLED:       { bg: '#fee2e2', text: '#991b1b' },
  RETURNED:        { bg: '#fef3c7', text: '#92400e' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get('/api/v1/orders?size=50')
      .then(r => setOrders(r.data.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📦</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>Track Your Orders</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginHorizontal: 40 }}>
          Sign in to view your order history and track deliveries
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: 24, backgroundColor: '#16a34a', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#16a34a" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0a0a0a' }}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>No orders yet</Text>
            <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Start shopping to see your orders here</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/discover')}
              style={{ marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const statusStyle = STATUS_COLORS[item.status] || { bg: '#f3f4f6', text: '#374151' };
          return (
            <TouchableOpacity
              onPress={() => router.push(`/order/${item.id}`)}
              activeOpacity={0.85}
              style={{
                marginBottom: 12, borderRadius: 16, backgroundColor: '#fff',
                borderWidth: 1, borderColor: '#f3f4f6',
                shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
              }}
            >
              <View style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0a0a0a' }}>{item.orderNumber}</Text>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: statusStyle.bg }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: statusStyle.text }}>
                      {item.status?.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
                <Text numberOfLines={1} style={{ fontSize: 13, color: '#374151' }}>
                  {item.firstProductName}{item.itemCount > 1 ? ` +${item.itemCount - 1} more` : ''}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0a0a0a' }}>
                    ₹{item.finalAmount?.toLocaleString('en-IN')}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : ''}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
