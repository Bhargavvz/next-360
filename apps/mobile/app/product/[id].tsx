import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  FlatList,
  Share,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import {
  ArrowLeft, Heart, Share2, Minus, Plus, Leaf, Star, Truck, RotateCcw,
  FileCheck, Store, ShoppingBag, Check,
} from 'lucide-react-native';
import { useProduct, useProductReviews } from '../../lib/hooks/useProducts';
import { useCartStore } from '../../lib/store/cart';
import { useWishlistStore } from '../../lib/store/wishlist';
import { useAuthStore } from '../../lib/auth';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Price } from '../../components/ui/Price';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  VerifiedSeal, TypeMark, CertificateId, PRODUCT_TYPES, type ProductType,
} from '../../components/ui/TrustMark';

/** Circular control that floats over the gallery. */
function GlassButton({
  onPress,
  children,
  label,
}: {
  onPress: () => void;
  children: React.ReactNode;
  label: string;
}) {
  const { colors, shadow } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        ...shadow.sm,
      }}
    >
      {children}
    </Pressable>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useScreenInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const { isAuthenticated } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore();

  const [imageIndex, setImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading } = useProduct(id);
  const { data: reviewsData } = useProductReviews(product?.id);
  const reviews: any[] = reviewsData?.content ?? [];

  const addToCart = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return false;
    }
    setAdding(true);
    try {
      await addItem({ productId: product.id, quantity });
      return true;
    } catch (err: any) {
      Alert.alert('Could not add to cart', err.message);
      return false;
    } finally {
      setAdding(false);
    }
  }, [addItem, isAuthenticated, product, quantity]);

  if (isLoading || !product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Skeleton style={{ height: 360, width: '100%' }} />
        <View style={{ padding: Spacing[5], gap: Spacing[3] }}>
          <Skeleton style={{ height: 12, width: '35%' }} />
          <Skeleton style={{ height: 28, width: '85%' }} />
          <Skeleton style={{ height: 22, width: '30%' }} />
          <Skeleton style={{ height: 90, width: '100%', borderRadius: Radius.xl }} />
        </View>
      </View>
    );
  }

  const rawImages: { url: string }[] = product.images ?? [];
  const images = rawImages.length
    ? rawImages
    : product.primaryImageUrl
      ? [{ url: product.primaryImageUrl }]
      : [];

  const stock = product.stock ?? 0;
  const inStock = stock > 0;
  const wishlisted = isWishlisted(product.id);
  const typeConfig = product.productType
    ? PRODUCT_TYPES[product.productType as ProductType]
    : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* ── Gallery ─────────────────────────────────── */}
        <View style={{ height: 380, backgroundColor: colors.surfaceSunken }}>
          {images.length > 0 ? (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onMomentumScrollEnd={(e) =>
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
              }
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item.url }}
                  style={{ width, height: 380 }}
                  contentFit="cover"
                  transition={220}
                />
              )}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={54} color={colors.borderStrong} strokeWidth={1} />
            </View>
          )}

          {/* Controls */}
          <View
            style={{
              position: 'absolute',
              top: insets.top,
              left: Spacing[5],
              right: Spacing[5],
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <GlassButton onPress={() => router.back()} label="Go back">
              <ArrowLeft size={19} color={colors.text} />
            </GlassButton>

            <View style={{ flexDirection: 'row', gap: Spacing[2] }}>
              <GlassButton
                onPress={() =>
                  Share.share({
                    message: `${product.name} on Next360\nhttps://next360.in/products/${product.slug}`,
                  })
                }
                label="Share"
              >
                <Share2 size={17} color={colors.text} />
              </GlassButton>
              <GlassButton
                onPress={() =>
                  toggleWishlist({
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    imageUrl: images[0]?.url,
                    price: product.price,
                    mrp: product.mrp,
                    productType: product.productType,
                    sellerName: product.sellerName,
                  })
                }
                label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  size={17}
                  color={wishlisted ? colors.error : colors.text}
                  fill={wishlisted ? colors.error : 'transparent'}
                />
              </GlassButton>
            </View>
          </View>

          {/* Page dots */}
          {images.length > 1 && (
            <View
              style={{
                position: 'absolute',
                bottom: Spacing[4],
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {images.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === imageIndex ? 18 : 6,
                    height: 6,
                    borderRadius: Radius.full,
                    backgroundColor: i === imageIndex ? colors.surface : `${colors.surface}80`,
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Detail ──────────────────────────────────── */}
        <View style={{ padding: Spacing[5], gap: Spacing[4] }}>
          <View style={{ gap: Spacing[2] }}>
            {product.sellerName && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Store size={12} color={colors.textSubtle} />
                <Text variant="eyebrow" tone="subtle">
                  {product.sellerName}
                </Text>
              </View>
            )}

            <Text variant="display" style={{ fontSize: 27 }}>
              {product.name}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
              {product.rating ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Star size={14} color={colors.seal} fill={colors.seal} />
                  <Text variant="label">{Number(product.rating).toFixed(1)}</Text>
                  <Text variant="caption" tone="subtle">
                    ({product.reviewCount ?? 0})
                  </Text>
                </View>
              ) : (
                <Text variant="caption" tone="subtle">
                  No reviews yet
                </Text>
              )}

              {inStock ? (
                stock <= 5 ? (
                  <Text variant="caption" style={{ color: colors.warning }}>
                    Only {stock} left
                  </Text>
                ) : (
                  <Text variant="caption" tone="success">
                    In stock
                  </Text>
                )
              ) : (
                <Text variant="caption" tone="error">
                  Out of stock
                </Text>
              )}
            </View>

            <Price value={product.price} mrp={product.mrp} size="xl" style={{ marginTop: 2 }} />
            <Text variant="caption" tone="subtle">
              Inclusive of all taxes
            </Text>
          </View>

          {/* Trust panel — the reason the marketplace exists gets real estate. */}
          {product.isVerifiedOrganic ? (
            <Card variant="seal" padding="md" style={{ flexDirection: 'row', gap: Spacing[3] }}>
              <VerifiedSeal size="md" showLabel={false} />
              <View style={{ flex: 1, gap: Spacing[1] }}>
                <Text variant="label" tone="seal">
                  NPOP certificate verified
                </Text>
                <Text variant="caption" tone="secondary">
                  Our team checked this seller&rsquo;s certificate against this listing.
                </Text>
                {product.verificationId && (
                  <CertificateId id={product.verificationId} style={{ marginTop: Spacing[1.5] }} />
                )}
              </View>
            </Card>
          ) : typeConfig ? (
            <Card padding="md" style={{ flexDirection: 'row', gap: Spacing[3] }}>
              <TypeMark type={product.productType} />
              <View style={{ flex: 1, gap: Spacing[1] }}>
                <Text variant="label">{typeConfig.label} — seller-declared</Text>
                <Text variant="caption" tone="secondary">
                  This claim comes from the seller, who is KYC-verified. It does not carry an
                  organic certificate.
                </Text>
              </View>
            </Card>
          ) : null}

          {/* Service promises */}
          <View style={{ flexDirection: 'row', gap: Spacing[3] }}>
            {[
              { Icon: Truck, label: 'Ships from source' },
              { Icon: FileCheck, label: 'KYC-verified seller' },
              { Icon: RotateCcw, label: 'Easy returns' },
            ].map(({ Icon, label }) => (
              <View key={label} style={{ flex: 1, alignItems: 'center', gap: Spacing[1.5] }}>
                <Icon size={18} color={colors.primary} strokeWidth={1.8} />
                <Text variant="caption" tone="secondary" center>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Description + specs */}
          {product.description && (
            <View style={{ gap: Spacing[2] }}>
              <Text variant="title">About this product</Text>
              <Text variant="body" tone="secondary">
                {product.description}
              </Text>
            </View>
          )}

          {[
            ['Ingredients', product.ingredients],
            ['Origin', product.origin],
            ['Weight', product.weight],
            ['Storage', product.storageInstructions],
            ['SKU', product.sku],
          ].filter(([, v]) => !!v).length > 0 && (
            <Card variant="sunken" padding="md" style={{ gap: Spacing[2.5] }}>
              {[
                ['Ingredients', product.ingredients],
                ['Origin', product.origin],
                ['Weight', product.weight],
                ['Storage', product.storageInstructions],
                ['SKU', product.sku],
              ]
                .filter(([, value]) => !!value)
                .map(([label, value]) => (
                  <View key={String(label)} style={{ flexDirection: 'row', gap: Spacing[4] }}>
                    <Text variant="caption" tone="secondary" style={{ width: 92 }}>
                      {label}
                    </Text>
                    <Text variant="caption" style={{ flex: 1 }}>
                      {String(value)}
                    </Text>
                  </View>
                ))}
            </Card>
          )}

          {/* Reviews */}
          <View style={{ gap: Spacing[3] }}>
            <Text variant="title">What buyers say</Text>
            {reviews.length === 0 ? (
              <Text variant="caption" tone="secondary">
                No reviews yet. Only buyers with a delivered order for this product can leave one,
                so there is nothing here to pad the numbers with.
              </Text>
            ) : (
              reviews.slice(0, 5).map((review: any) => (
                <Card key={review.id} padding="md" style={{ gap: Spacing[1.5] }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
                    <View style={{ flexDirection: 'row', gap: 1 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          color={i < review.rating ? colors.seal : colors.borderStrong}
                          fill={i < review.rating ? colors.seal : colors.borderStrong}
                        />
                      ))}
                    </View>
                    {review.isVerifiedPurchase && (
                      <Text variant="caption" tone="success">
                        Verified purchase
                      </Text>
                    )}
                  </View>
                  {review.title && <Text variant="label">{review.title}</Text>}
                  {review.comment && (
                    <Text variant="caption" tone="secondary">
                      {review.comment}
                    </Text>
                  )}
                  <Text variant="caption" tone="subtle">
                    {review.userName ?? 'Verified buyer'}
                  </Text>
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky buy bar ──────────────────────────── */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing[3],
          paddingHorizontal: Spacing[5],
          paddingTop: Spacing[3.5],
          paddingBottom: insets.bottom + Spacing[2],
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
            borderRadius: Radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            style={{ width: 38, height: 48, alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel="Decrease quantity"
          >
            <Minus size={15} color={quantity <= 1 ? colors.textSubtle : colors.text} />
          </Pressable>
          <Text variant="label" style={{ width: 24, textAlign: 'center' }}>
            {quantity}
          </Text>
          <Pressable
            onPress={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
            disabled={quantity >= stock}
            style={{ width: 38, height: 48, alignItems: 'center', justifyContent: 'center' }}
            accessibilityLabel="Increase quantity"
          >
            <Plus size={15} color={quantity >= stock ? colors.textSubtle : colors.text} />
          </Pressable>
        </View>

        <Button
          size="lg"
          style={{ flex: 1 }}
          loading={adding}
          disabled={!inStock}
          onPress={async () => {
            if (!(await addToCart())) return;
            Alert.alert('Added to cart', `${quantity} × ${product.name}`, [
              { text: 'Keep shopping', style: 'cancel' },
              { text: 'View cart', onPress: () => router.push('/(tabs)/cart') },
            ]);
          }}
          leftIcon={<ShoppingBag size={17} color={colors.primaryOn} />}
        >
          {inStock ? 'Add to cart' : 'Out of stock'}
        </Button>
      </View>
    </View>
  );
}
