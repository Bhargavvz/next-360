import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { publicApi } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

const categories = [
  { name: 'Honey', icon: '🍯', slug: 'honey' },
  { name: 'Spices', icon: '🌶️', slug: 'spices' },
  { name: 'Oils', icon: '🫒', slug: 'oils' },
  { name: 'Grains', icon: '🌾', slug: 'grains' },
  { name: 'Tea', icon: '🍵', slug: 'tea' },
  { name: 'Skincare', icon: '🧴', slug: 'skincare' },
  { name: 'Snacks', icon: '🥜', slug: 'snacks' },
  { name: 'Baby', icon: '👶', slug: 'baby' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [trending, setTrending] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicApi.get('/api/v1/search/trending?size=6').then(r => setTrending(r.data.data?.content || [])).catch(() => {}),
      publicApi.get('/api/v1/search/verified-organic?size=6').then(r => setVerified(r.data.data?.content || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '800', color: '#0a0a0a', letterSpacing: -0.5 }}>
              Next<Text style={{ color: '#16a34a' }}>360</Text>
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {user ? `Hi, ${user.name || 'there'} 👋` : 'Shop verified. Buy with confidence.'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => router.push('/cart')}>
              <Text style={{ fontSize: 22 }}>🛒</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/discover')}
          style={{ marginHorizontal: 16, marginBottom: 16 }}
        >
          <View style={{
            backgroundColor: '#f3f4f6', borderRadius: 14, padding: 14,
            flexDirection: 'row', alignItems: 'center', gap: 10,
          }}>
            <Text style={{ fontSize: 16, color: '#9ca3af' }}>🔍</Text>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>Search organic products...</Text>
          </View>
        </TouchableOpacity>

        {/* Verified CTA */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/discover')}
          style={{ marginHorizontal: 16, marginBottom: 20 }}
        >
          <View style={{
            backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16,
            borderWidth: 1.5, borderColor: '#bbf7d0',
          }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#166534' }}>
              🛡️ Verified Organic Products
            </Text>
            <Text style={{ fontSize: 13, color: '#15803d', marginTop: 4, lineHeight: 18 }}>
              NPOP certified & independently verified. Tap to browse.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginLeft: 16, marginBottom: 12 }}>
            Categories
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.slug} style={{ alignItems: 'center', marginHorizontal: 6, width: 72 }}>
                <View style={{
                  width: 56, height: 56, borderRadius: 16, backgroundColor: '#f9fafb',
                  alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6',
                }}>
                  <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
                </View>
                <Text style={{ fontSize: 11, color: '#374151', marginTop: 6, fontWeight: '500', textAlign: 'center' }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a' }}>Trending Now</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
              <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '600' }}>See All →</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator color="#16a34a" style={{ padding: 40 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {trending.map((p: any) => (
                <ProductCard key={p.id} product={p} onPress={() => router.push(`/product/${p.slug || p.id}`)} />
              ))}
              {trending.length === 0 && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: '#9ca3af', fontSize: 13 }}>No products yet</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Verified Organic */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a' }}>🛡️ Verified Organic</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#16a34a" style={{ padding: 40 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12 }}>
              {verified.map((p: any) => (
                <ProductCard key={p.id} product={p} onPress={() => router.push(`/product/${p.slug || p.id}`)} />
              ))}
              {verified.length === 0 && (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ color: '#9ca3af', fontSize: 13 }}>No verified products yet</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({ product, onPress }: { product: any; onPress: () => void }) {
  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ marginHorizontal: 6, width: 160 }}>
      <View style={{ borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' }}>
        <View style={{ height: 160, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {product.imageUrl ? (
            <View style={{ width: '100%', height: '100%', backgroundColor: '#e5e7eb' }}>
              <Text style={{ textAlign: 'center', marginTop: 60, color: '#9ca3af' }}>🌿</Text>
            </View>
          ) : (
            <Text style={{ fontSize: 40, color: '#d1d5db' }}>🌿</Text>
          )}
          {(product.isVerifiedOrganic || product.verifiedOrganic) && (
            <View style={{
              position: 'absolute', top: 8, left: 8, backgroundColor: '#16a34a',
              paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
            }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>✓ VERIFIED</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={{
              position: 'absolute', top: 8, right: 8, backgroundColor: '#ef4444',
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20,
            }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{discount}% OFF</Text>
            </View>
          )}
        </View>
        <View style={{ padding: 10 }}>
          <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '500', color: '#1f2937', lineHeight: 17 }}>{product.name}</Text>
          {product.sellerName && (
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>by {product.sellerName}</Text>
          )}
          {product.rating > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '700' }}>⭐ {product.rating?.toFixed(1)}</Text>
              </View>
              <Text style={{ fontSize: 10, color: '#9ca3af' }}>({product.reviewCount})</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0a0a0a' }}>₹{product.price}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={{ fontSize: 12, color: '#9ca3af', textDecorationLine: 'line-through' }}>₹{product.mrp}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
