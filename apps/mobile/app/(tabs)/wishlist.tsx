import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

export default function WishlistScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    api.get('/api/v1/wishlist?size=50')
      .then(r => setItems(r.data.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    fetchWishlist();
  }, [isAuthenticated]);

  const removeFromWishlist = async (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
    await api.delete(`/api/v1/wishlist/${productId}`).catch(() => {});
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>❤️</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>Your Wishlist</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginHorizontal: 40 }}>
          Sign in to save your favourite organic products
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
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0a0a0a' }}>
          Wishlist {items.length > 0 && <Text style={{ color: '#9ca3af', fontWeight: '400' }}>({items.length})</Text>}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>💚</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>Wishlist is empty</Text>
            <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Tap ❤️ on products to save them here</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/discover')}
              style={{ marginTop: 20, backgroundColor: '#16a34a', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Discover Products</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ width: '48%', marginBottom: 14 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push(`/product/${item.productSlug || item.productId}`)}
            >
              <View style={{
                borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6',
                shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, overflow: 'hidden',
              }}>
                <View style={{ height: 130, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Text style={{ fontSize: 36, color: '#d1d5db' }}>🌿</Text>
                  {/* Remove btn */}
                  <TouchableOpacity
                    onPress={() => removeFromWishlist(item.productId)}
                    style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                  >
                    <Text style={{ fontSize: 13 }}>❤️</Text>
                  </TouchableOpacity>
                  {item.isVerifiedOrganic && (
                    <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: '#16a34a', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 }}>
                      <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>✓ VERIFIED</Text>
                    </View>
                  )}
                </View>
                <View style={{ padding: 10 }}>
                  <Text numberOfLines={2} style={{ fontSize: 12, fontWeight: '600', color: '#1f2937', lineHeight: 16 }}>{item.productName}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#0a0a0a', marginTop: 6 }}>
                    ₹{item.price?.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
