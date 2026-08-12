import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../lib/auth';
import { ShoppingCart, ArrowLeft, Leaf, Minus, Plus, Trash2, AlertTriangle, ArrowRight } from 'lucide-react-native';

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = () => {
    api.get('/api/v1/cart')
      .then(r => { setCart(r.data.data); setError(''); })
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetchCart();
  }, [isAuthenticated]);

  const updateQty = async (itemId: string, qty: number) => {
    await api.put(`/api/v1/cart/${itemId}?quantity=${qty}`).catch(() => {});
    fetchCart();
  };

  const removeItem = async (itemId: string) => {
    setCart((c: any) => c ? { ...c, items: c.items.filter((i: any) => i.id !== itemId) } : c);
    await api.delete(`/api/v1/cart/${itemId}`).catch(() => {});
    fetchCart();
  };

  const handleCheckout = async () => {
    setPlacing(true); setError('');
    try {
      const res = await api.post('/api/v1/orders', {
        paymentMethod: 'COD', notes: '',
      });
      const orderId = res.data.data?.id;
      router.push(orderId ? `/order/${orderId}` : '/(tabs)/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingCart size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>Your Cart</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginHorizontal: 40 }}>Sign in to add items and place orders</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginTop: 24, backgroundColor: '#16a34a', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}>
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

  const items = cart?.items || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#0a0a0a', flex: 1 }}>
          Cart {items.length > 0 && <Text style={{ color: '#9ca3af', fontWeight: '400' }}>({items.length})</Text>}
        </Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => api.delete('/api/v1/cart').then(fetchCart)}>
            <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '600' }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingCart size={64} color="#9ca3af" style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>Your cart is empty</Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>Add some organic goodness to get started</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/discover')} style={{ marginTop: 24, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {items.map((item: any) => (
              <View key={item.id} style={{
                flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
                padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6',
                shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
              }}>
                {/* Image placeholder */}
                <View style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Leaf size={30} color="#d1d5db" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: '600', color: '#0a0a0a', lineHeight: 18, marginBottom: 4 }}>{item.productName}</Text>
                  {item.sellerName && <Text style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>by {item.sellerName}</Text>}

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Qty controls */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                      <TouchableOpacity onPress={() => updateQty(item.id, Math.max(1, item.quantity - 1))} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                        <Minus size={16} color="#374151" />
                      </TouchableOpacity>
                      <Text style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: '700' }}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQty(item.id, item.quantity + 1)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                        <Plus size={16} color="#374151" />
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#0a0a0a' }}>₹{item.totalPrice?.toLocaleString('en-IN')}</Text>
                      <TouchableOpacity onPress={() => removeItem(item.id)}>
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Checkout bar */}
          <View style={{
            backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6',
            shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>Subtotal ({items.length} items)</Text>
              <Text style={{ fontSize: 13, color: '#0a0a0a', fontWeight: '600' }}>₹{cart?.totalAmount?.toLocaleString('en-IN')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: '#6b7280' }}>Delivery</Text>
              <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '600' }}>FREE</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0a0a0a' }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0a0a0a' }}>₹{cart?.totalAmount?.toLocaleString('en-IN')}</Text>
            </View>
            {error ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <AlertTriangle size={12} color="#ef4444" style={{ marginRight: 4 }} />
                <Text style={{ fontSize: 12, color: '#ef4444' }}>{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              onPress={handleCheckout}
              disabled={placing}
              style={{
                backgroundColor: placing ? '#86efac' : '#16a34a', borderRadius: 14, paddingVertical: 16,
                alignItems: 'center', shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                flexDirection: 'row', justifyContent: 'center',
              }}
            >
              {placing ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginRight: 4 }}>Checkout ₹{cart?.totalAmount?.toLocaleString('en-IN')}</Text>
                  <ArrowRight size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
