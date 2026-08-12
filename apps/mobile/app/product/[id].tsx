import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Dimensions,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProduct, useProductReviews } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useWishlistStore } from '../../lib/store/wishlist';
import { useAuthStore } from '../../lib/auth';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StarRating, RatingBar } from '../../components/ui/StarRating';
import { Skeleton } from '../../components/ui/Skeleton';
import { Colors, Spacing, Typography, Radius, Shadow } from '../../lib/theme';
import { ArrowLeft, Heart, Share as ShareIcon, Package, ShieldCheck, Leaf, Recycle, Check, Minus, Plus, ChevronUp, ChevronDown } from 'lucide-react-native';

const { width: SCREEN_W } = Dimensions.get('window');

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={accordionStyles.wrapper}>
      <TouchableOpacity style={accordionStyles.header} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <Text style={accordionStyles.title}>{title}</Text>
        {open ? <ChevronUp size={16} color={Colors.gray400} /> : <ChevronDown size={16} color={Colors.gray400} />}
      </TouchableOpacity>
      {open && <View style={accordionStyles.body}>{children}</View>}
    </View>
  );
}

const accordionStyles = StyleSheet.create({
  wrapper: { borderTopWidth: 1, borderTopColor: Colors.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing[4] },
  title: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  body: { paddingHorizontal: Spacing[4], paddingBottom: Spacing[4] },
});

export default function ProductDetailScreen() {
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useProduct(slug);
  const { data: reviewsData } = useProductReviews(product?.id);
  const { addItem } = useCartStore();
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  if (isLoading || !product) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.backBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={18} color={Colors.gray800} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <Skeleton height={360} radius={0} />
          <View style={{ padding: Spacing[5], gap: Spacing[3] }}>
            <Skeleton height={14} width="40%" />
            <Skeleton height={24} />
            <Skeleton height={20} width="30%" />
            <Skeleton height={14} width="60%" />
          </View>
        </ScrollView>
      </View>
    );
  }

  const images: { url: string }[] = product.images ?? [];
  const discount = product.mrp && product.mrp > product.price
    ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const wishlisted = isWishlisted(product.id);
  const reviews = reviewsData?.content ?? [];
  const totalRating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: images[0]?.url,
        price: product.price,
        mrp: product.mrp,
        sellerName: product.sellerName,
        stock: product.stock,
      });
    }
    Alert.alert('Added to cart', `${quantity}x ${product.name} added to cart`, [
      { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      { text: 'Continue', style: 'cancel' },
    ]);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleShare = async () => {
    await Share.share({ message: `Check out ${product.name} on Next360!\nhttps://next360.in/products/${product.slug}` });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Floating header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color={Colors.gray800} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => toggleWishlist({ productId: product.id, slug: product.slug, name: product.name, imageUrl: images[0]?.url, price: product.price, mrp: product.mrp, productType: product.productType, sellerName: product.sellerName })}
          >
            <Heart size={18} color={wishlisted ? Colors.error : Colors.gray700} fill={wishlisted ? Colors.error : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
            <ShareIcon size={18} color={Colors.gray700} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View style={styles.carouselContainer}>
          {images.length > 0 ? (
            <>
              <FlatList
                data={images}
                keyExtractor={(_, i) => String(i)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  setImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
                }}
                renderItem={({ item }) => (
                  <Image source={{ uri: item.url }} style={styles.carouselImage} resizeMode="cover" />
                )}
              />
              {images.length > 1 && (
                <View style={styles.dots}>
                  {images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === imageIndex && styles.dotActive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noImage}>
              <Package size={64} color={Colors.gray300} />
            </View>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Product info */}
        <View style={styles.infoSection}>
          {/* Type + verified badge */}
          <View style={styles.badgesRow}>
            {product.productType && (
              <Badge variant={product.productType === 'ORGANIC' ? 'organic' : product.productType === 'NATURAL' ? 'natural' : 'eco'}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {product.productType === 'ORGANIC' ? <ShieldCheck size={12} color={Colors.white} style={{ marginRight: 4 }} /> :
                   product.productType === 'NATURAL' ? <Leaf size={12} color={Colors.white} style={{ marginRight: 4 }} /> :
                   <Recycle size={12} color={Colors.white} style={{ marginRight: 4 }} />}
                  <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '600' }}>
                    {product.productType === 'ORGANIC' ? 'NPOP Organic' : product.productType === 'NATURAL' ? 'Natural' : 'Eco-Friendly'}
                  </Text>
                </View>
              </Badge>
            )}
            {product.isVerifiedOrganic && (
              <Badge variant="organic">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Check size={12} color={Colors.white} style={{ marginRight: 4 }} />
                  <Text style={{ color: Colors.white, fontSize: 12, fontWeight: '600' }}>Verified</Text>
                </View>
              </Badge>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          {reviewCount > 0 && (
            <View style={styles.ratingRow}>
              <StarRating rating={totalRating} size={14} />
              <Text style={styles.ratingText}>{totalRating.toFixed(1)} ({reviewCount} reviews)</Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceBlock}>
            <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</Text>
            )}
            {discount > 0 && <Text style={styles.discountText}>Save {discount}%</Text>}
          </View>

          {/* Seller info */}
          {product.sellerName && (
            <View style={styles.sellerRow}>
              <Text style={styles.sellerLabel}>Sold by:</Text>
              <Text style={styles.sellerName}>{product.sellerName}</Text>
            </View>
          )}

          {/* Stock warning */}
          {product.stock < 10 && product.stock > 0 && (
            <Text style={styles.stockWarning}>Only {product.stock} left in stock</Text>
          )}
          {product.stock === 0 && (
            <Text style={[styles.stockWarning, { color: Colors.error }]}>Out of Stock</Text>
          )}

          {/* Quantity selector */}
          {product.stock > 0 && (
            <View style={styles.qtyRow}>
              <Text style={styles.qtyLabel}>Quantity:</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={18} color={Colors.gray700} />
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= product.stock && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={18} color={Colors.gray700} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Details */}
          {product.weight && <Text style={styles.detail}>Weight: {product.weight}</Text>}
          {product.origin && <Text style={styles.detail}>Origin: {product.origin}</Text>}
        </View>

        {/* Accordions */}
        <View style={styles.accordionSection}>
          {product.description && (
            <Accordion title="Description">
              <Text style={styles.accordionText}>{product.description}</Text>
            </Accordion>
          )}
          {product.ingredients && (
            <Accordion title="Ingredients">
              <Text style={styles.accordionText}>{product.ingredients}</Text>
            </Accordion>
          )}
          {product.nutritionalInfo && (
            <Accordion title="Nutritional Info">
              <Text style={styles.accordionText}>{product.nutritionalInfo}</Text>
            </Accordion>
          )}
          {product.storageInstructions && (
            <Accordion title="Storage Instructions">
              <Text style={styles.accordionText}>{product.storageInstructions}</Text>
            </Accordion>
          )}
        </View>

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            <RatingBar
              distribution={{ 5: reviewCount, 4: 0, 3: 0, 2: 0, 1: 0 }}
              totalCount={reviewCount}
              averageRating={totalRating}
            />
            {reviews.slice(0, 3).map((review: any) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.customerName ?? 'Customer'}</Text>
                  <StarRating rating={review.rating} size={12} />
                </View>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA bar */}
      {product.stock > 0 && (
        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + Spacing[3] }]}>
          <Button variant="secondary" size="lg" onPress={handleAddToCart} style={{ flex: 1 } as any}>
            Add to Cart
          </Button>
          <Button size="lg" onPress={handleBuyNow} style={{ flex: 1 } as any}>
            Buy Now
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  backBar: { paddingHorizontal: Spacing[4], paddingVertical: Spacing[3] },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  headerActions: { flexDirection: 'row', gap: Spacing[2] },
  headerBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.md,
  },
  carouselContainer: { position: 'relative' },
  carouselImage: { width: SCREEN_W, height: SCREEN_W * 0.85, backgroundColor: Colors.gray100 },
  noImage: { width: SCREEN_W, height: SCREEN_W * 0.85, backgroundColor: Colors.gray100, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingVertical: Spacing[2] },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gray300 },
  dotActive: { backgroundColor: Colors.primary, width: 18 },
  discountTag: {
    position: 'absolute', bottom: Spacing[4], left: Spacing[4],
    backgroundColor: Colors.error,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[2], paddingVertical: 4,
  },
  discountTagText: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.white },
  infoSection: { padding: Spacing[5], gap: Spacing[3] },
  badgesRow: { flexDirection: 'row', gap: Spacing[2], flexWrap: 'wrap' },
  productName: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900, lineHeight: 30 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  ratingText: { fontSize: Typography.sm, color: Colors.gray500 },
  priceBlock: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing[2], flexWrap: 'wrap' },
  price: { fontSize: Typography['2xl'], fontWeight: Typography.extrabold, color: Colors.gray900 },
  mrp: { fontSize: Typography.base, color: Colors.gray400, textDecorationLine: 'line-through' },
  discountText: { fontSize: Typography.sm, color: Colors.success, fontWeight: Typography.semibold },
  sellerRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  sellerLabel: { fontSize: Typography.sm, color: Colors.gray400 },
  sellerName: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
  stockWarning: { fontSize: Typography.sm, color: Colors.warning, fontWeight: Typography.semibold },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[4] },
  qtyLabel: { fontSize: Typography.base, color: Colors.gray700, fontWeight: Typography.medium },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  qtyBtn: {
    width: 36, height: 36, borderRadius: Radius.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyNum: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.gray900, minWidth: 28, textAlign: 'center' },
  detail: { fontSize: Typography.sm, color: Colors.gray500 },
  accordionSection: { borderTopWidth: 1, borderTopColor: Colors.border },
  accordionText: { fontSize: Typography.sm, color: Colors.gray600, lineHeight: 22 },
  reviewsSection: { padding: Spacing[5], gap: Spacing[4], borderTopWidth: 1, borderTopColor: Colors.border },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.gray900 },
  reviewCard: { backgroundColor: Colors.gray50, borderRadius: Radius.lg, padding: Spacing[4], gap: Spacing[1] },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray900 },
  reviewComment: { fontSize: Typography.sm, color: Colors.gray600, lineHeight: 20 },
  reviewDate: { fontSize: Typography.xs, color: Colors.gray400 },
  ctaBar: {
    flexDirection: 'row',
    gap: Spacing[3],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.lg,
  },
});
