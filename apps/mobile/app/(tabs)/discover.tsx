import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';
import { api } from '../../lib/api';

const FILTERS = [
  { label: 'All', value: '' },
  { label: '🟢 Organic', value: 'ORGANIC' },
  { label: '🟡 Natural', value: 'NATURAL' },
  { label: '🔵 Eco', value: 'ECO_FRIENDLY' },
  { label: '✓ Verified', value: 'verified' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const p = reset ? 0 : page;
    try {
      const params = new URLSearchParams({ page: String(p), size: '20' });
      if (query) params.set('query', query);
      if (activeFilter === 'verified') params.set('verifiedOnly', 'true');
      else if (activeFilter) params.set('productType', activeFilter);

      const res = await publicApi.get(`/api/v1/products?${params}`);
      const content = res.data.data?.content || [];
      setProducts(prev => reset ? content : [...prev, ...content]);
      setHasMore(!res.data.data?.last);
      setPage(p + 1);
    } catch {}
    setLoading(false);
  }, [query, activeFilter, page, loading]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(true);
  }, [query, activeFilter]);

  // Load wishlist
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/api/v1/wishlist?size=100')
      .then(r => {
        const ids = new Set<string>((r.data.data?.content || []).map((i: any) => i.productId));
        setWishlist(ids);
      }).catch(() => {});
  }, [isAuthenticated]);

  const toggleWishlist = async (productId: string) => {
    if (!isAuthenticated) { router.push('/(auth)/login'); return; }
    const inWishlist = wishlist.has(productId);
    setWishlist(prev => {
      const s = new Set(prev);
      inWishlist ? s.delete(productId) : s.add(productId);
      return s;
    });
    try {
      if (inWishlist) await api.delete(`/api/v1/wishlist/${productId}`);
      else await api.post(`/api/v1/wishlist/${productId}`);
    } catch {}
  };

  const renderProduct = ({ item }: { item: any }) => {
    const discount = item.mrp && item.mrp > item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;
    const inWishlist = wishlist.has(item.id);

    return (
      <View style={{ width: '48%', marginBottom: 14 }}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push(`/product/${item.slug || item.id}`)}
        >
          <View style={{
            borderRadius: 16, backgroundColor: '#fff',
            borderWidth: 1, borderColor: '#f3f4f6',
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
            overflow: 'hidden',
          }}>
            {/* Image */}
            <View style={{ height: 150, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Text style={{ fontSize: 44, color: '#d1d5db' }}>🌿</Text>
              {(item.isVerifiedOrganic || item.verifiedOrganic) && (
                <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#16a34a', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>✓ VERIFIED</Text>
                </View>
              )}
              {discount > 0 && (
                <View style={{ position: 'absolute', top: 8, right: 36, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{discount}% OFF</Text>
                </View>
              )}
              {/* Wishlist btn */}
              <TouchableOpacity
                onPress={() => toggleWishlist(item.id)}
                style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
              >
                <Text style={{ fontSize: 14 }}>{inWishlist ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={{ padding: 10 }}>
              <Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '600', color: '#1f2937', lineHeight: 18 }}>{item.name}</Text>
              {item.sellerName && <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>by {item.sellerName}</Text>}
              {item.rating > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Text style={{ fontSize: 10, color: '#f59e0b', fontWeight: '700' }}>★ {item.rating?.toFixed(1)}</Text>
                  <Text style={{ fontSize: 10, color: '#9ca3af' }}>({item.reviewCount})</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0a0a0a' }}>₹{item.price?.toLocaleString('en-IN')}</Text>
                {item.mrp > item.price && (
                  <Text style={{ fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through' }}>₹{item.mrp?.toLocaleString('en-IN')}</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0a0a0a', marginBottom: 12 }}>Discover</Text>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, gap: 10 }}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            placeholder="Search organic products..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, fontSize: 15, color: '#0a0a0a' }}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ fontSize: 16, color: '#9ca3af' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              style={{
                marginRight: 8,
                paddingHorizontal: 14, paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: activeFilter === f.value ? '#16a34a' : '#f3f4f6',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: activeFilter === f.value ? '#fff' : '#374151',
              }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products grid */}
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={() => hasMore && !loading && fetchProducts()}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#16a34a" style={{ padding: 60 }} />
          ) : (
            <View style={{ alignItems: 'center', padding: 60 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🌿</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#374151' }}>No products found</Text>
              <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Try a different search or filter</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && products.length > 0 ? <ActivityIndicator color="#16a34a" style={{ padding: 20 }} /> : null
        }
      />
    </SafeAreaView>
  );
}
