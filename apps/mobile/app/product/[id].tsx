import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { publicApi, api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<any>(null);

  useEffect(() => {
    publicApi.get(`/api/v1/products/${id}`)
      .then((res: any) => {
        const p = res.data.data;
        setProduct(p);
        Promise.all([
          publicApi.get(`/api/v1/products/${p.id}/reviews?size=5`)
            .then((r: any) => setReviews(r.data.data?.content || [])).catch(() => {}),
          publicApi.get(`/api/v1/products/${p.id}/ratings`)
            .then((r: any) => setRatingSummary(r.data.data)).catch(() => {}),
          isAuthenticated
            ? api.get(`/api/v1/wishlist/${p.id}/check`)
              .then((r: any) => setInWishlist(r.data.data?.inWishlist ?? false)).catch(() => {})
            : Promise.resolve(),
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { router.push('/(auth)/login'); return; }
    setAdding(true);
    try {
      await api.post('/api/v1/cart', { productId: product.id, quantity });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch {}
    setAdding(false);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { router.push('/(auth)/login'); return; }
    const was = inWishlist;
    setInWishlist(!was);
    try {
      if (was) await api.delete(`/api/v1/wishlist/${product.id}`);
      else await api.post(`/api/v1/wishlist/${product.id}`);
    } catch { setInWishlist(was); }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#16a34a" size="large" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>😕</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a' }}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#16a34a', fontWeight: '600' }}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 24, color: '#374151' }}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleWishlist}>
          <Text style={{ fontSize: 24 }}>{inWishlist ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={{ height: 280, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <Text style={{ fontSize: 80, color: '#d1d5db' }}>🌿</Text>
          {(product.isVerifiedOrganic || product.verifiedOrganic) && (
            <View style={{ position: 'absolute', top: 16, left: 16, backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓ NPOP VERIFIED</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 20 }}>
          {/* Type badge */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: product.productType === 'ORGANIC' ? '#f0fdf4' : '#fffbeb' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: product.productType === 'ORGANIC' ? '#166534' : '#92400e' }}>
                {product.productType === 'ORGANIC' ? '🟢 Organic' : product.productType === 'NATURAL' ? '🟡 Natural' : '🔵 Eco-Friendly'}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0a0a0a', lineHeight: 28, marginBottom: 6 }}>{product.name}</Text>

          {product.sellerName && (
            <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Sold by {product.sellerName}</Text>
          )}

          {/* Rating */}
          {ratingSummary?.averageRating && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', gap: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#16a34a' }}>★ {Number(ratingSummary.averageRating).toFixed(1)}</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>({ratingSummary.totalReviews} reviews)</Text>
            </View>
          )}

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#0a0a0a' }}>₹{product.price?.toLocaleString('en-IN')}</Text>
            {product.mrp > product.price && (
              <Text style={{ fontSize: 16, color: '#9ca3af', textDecorationLine: 'line-through' }}>₹{product.mrp?.toLocaleString('en-IN')}</Text>
            )}
            {discount > 0 && (
              <Text style={{ fontSize: 14, color: '#16a34a', fontWeight: '600' }}>Save {discount}%</Text>
            )}
          </View>

          {/* Stock */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: product.stock > 0 ? '#16a34a' : '#ef4444', marginBottom: 20 }}>
            {product.stock > 0 ? `✓ In Stock (${product.stock} left)` : '✗ Out of Stock'}
          </Text>

          {/* Quantity + Cart */}
          {product.stock > 0 && (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#374151' }}>−</Text>
                </TouchableOpacity>
                <Text style={{ width: 36, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#0a0a0a' }}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{ width: 44, height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}
                >
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#374151' }}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleAddToCart}
                disabled={adding}
                style={{
                  flex: 1, borderRadius: 14, backgroundColor: addedToCart ? '#166534' : '#16a34a',
                  alignItems: 'center', justifyContent: 'center', height: 52,
                  shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                }}
              >
                {adding ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                    {addedToCart ? '✓ Added!' : '🛒 Add to Cart'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Promises */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {[{ icon: '🚚', label: 'Free Delivery' }, { icon: '↩️', label: '7-Day Returns' }, { icon: '🏅', label: 'Quality Assured' }].map(p => (
              <View key={p.label} style={{ flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 14, alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 18 }}>{p.icon}</Text>
                <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: '500', textAlign: 'center' }}>{p.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {product.description && (
            <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16, marginBottom: 20 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>Description</Text>
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>{product.description}</Text>
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0a0a0a', marginBottom: 12 }}>Customer Reviews</Text>
              {reviews.map(r => (
                <View key={r.id} style={{ backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a' }}>★ {r.rating}</Text>
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#0a0a0a' }}>{r.reviewerName || 'Anonymous'}</Text>
                      {r.isVerifiedPurchase && <Text style={{ fontSize: 10, color: '#16a34a', fontWeight: '600' }}>✓ Verified</Text>}
                    </View>
                  </View>
                  {r.title && <Text style={{ fontSize: 13, fontWeight: '600', marginBottom: 4 }}>{r.title}</Text>}
                  <Text style={{ fontSize: 13, color: '#374151', lineHeight: 18 }}>{r.comment}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
