import React, { useRef, useState } from 'react';
import { Animated, Pressable, View, ViewStyle, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Leaf, Plus, Check, Star } from 'lucide-react-native';
import { Radius, Spacing, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from './Text';
import { Price } from './Price';
import { VerifiedSeal, TypeMark } from './TrustMark';

export interface ProductCardData {
  id: string;
  slug?: string;
  name: string;
  primaryImageUrl?: string | null;
  price: number;
  mrp?: number | null;
  rating?: number | null;
  reviewCount?: number;
  isVerifiedOrganic?: boolean;
  sellerName?: string;
  productType?: string;
  stock?: number;
}

/** Diameter of the floating add button. */
const ADD_SIZE = 34;

interface Props {
  product: ProductCardData;
  layout?: 'grid' | 'rail';
  onAdd?: (product: ProductCardData) => Promise<void> | void;
  style?: ViewStyle;
}

/**
 * Product tile.
 *
 * The add button is a *sibling* of the card's Pressable rather than a child:
 * nesting one interactive element inside another throws on react-native-web and
 * makes hit-testing ambiguous on native. It is absolutely positioned so it still
 * appears to sit on the image corner — the q-commerce convention.
 */
export function ProductCard({ product, layout = 'grid', onAdd, style }: Props) {
  const { colors, shadow } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [cardWidth, setCardWidth] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const inStock = product.stock == null || product.stock > 0;
  const lowStock = inStock && typeof product.stock === 'number' && product.stock <= 5;
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleAdd = async () => {
    if (!onAdd || adding || !inStock) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAdding(true);
    try {
      await onAdd(product);
      setAdded(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTimeout(() => setAdded(false), 1600);
    } catch {
      // The caller surfaces the error; the card returns to its resting state.
    } finally {
      setAdding(false);
    }
  };

  return (
    <Animated.View
      style={[{ transform: [{ scale }] }, style]}
      onLayout={(e) => setCardWidth(e.nativeEvent.layout.width)}
    >
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40 }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()
        }
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ₹${product.price}`}
      >
        {/* Image */}
        <View
          style={{
            aspectRatio: 1,
            borderRadius: Radius.xl,
            backgroundColor: colors.surfaceSunken,
            overflow: 'hidden',
          }}
        >
          {product.primaryImageUrl ? (
            <Image
              source={{ uri: product.primaryImageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              // Fades in rather than popping, so a scrolling grid stays calm.
              transition={220}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={28} color={colors.borderStrong} strokeWidth={1.25} />
            </View>
          )}

          {/* Marks */}
          <View style={{ position: 'absolute', top: Spacing[2], left: Spacing[2], gap: 4 }}>
            {product.isVerifiedOrganic ? (
              <VerifiedSeal size="sm" />
            ) : (
              <TypeMark type={product.productType} size="sm" />
            )}
            {discount > 0 && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: Spacing[1.5],
                  height: 20,
                  justifyContent: 'center',
                  borderRadius: Radius.xs,
                  backgroundColor: colors.text,
                }}
              >
                <Text variant="eyebrow" tone="inverse" style={{ fontSize: Typography['2xs'] }}>
                  {discount}% off
                </Text>
              </View>
            )}
          </View>

          {!inStock && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingVertical: Spacing[1.5],
                backgroundColor: `${colors.text}D9`,
                alignItems: 'center',
              }}
            >
              <Text variant="caption" tone="inverse">
                Out of stock
              </Text>
            </View>
          )}

          {lowStock && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingVertical: Spacing[1.5],
                paddingRight: 44,
                backgroundColor: `${colors.warning}E6`,
                alignItems: 'center',
              }}
            >
              <Text variant="caption" tone="inverse">
                Only {product.stock} left
              </Text>
            </View>
          )}
        </View>

        {/* Copy */}
        <View style={{ marginTop: Spacing[2.5], gap: 3 }}>
          {product.sellerName && (
            <Text variant="eyebrow" tone="subtle" numberOfLines={1}>
              {product.sellerName}
            </Text>
          )}

          <Text variant="label" numberOfLines={2} style={{ minHeight: 36 }}>
            {product.name}
          </Text>

          {/* Rating sits between name and price — it is the thing shoppers scan
              for after the picture, and its absence is information too. */}
          {product.rating ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Star size={11} color={colors.seal} fill={colors.seal} />
              <Text variant="caption" tone="secondary">
                {Number(product.rating).toFixed(1)}
                {product.reviewCount ? ` (${product.reviewCount})` : ''}
              </Text>
            </View>
          ) : (
            <Text variant="caption" tone="subtle">
              No reviews yet
            </Text>
          )}

          <Price value={product.price} mrp={product.mrp} size="sm" style={{ marginTop: 2 }} />
        </View>
      </Pressable>

      {/* Add — sibling of the card Pressable, floated over the image corner.
          The image is 1:1, so its bottom edge sits exactly `cardWidth` down;
          the width is measured once on layout rather than assumed, because the
          grid and rail render this at different sizes. */}
      {onAdd && inStock && cardWidth > 0 && (
        <Pressable
          onPress={handleAdd}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name} to cart`}
          style={{
            position: 'absolute',
            right: Spacing[2],
            top: cardWidth - ADD_SIZE - Spacing[2],
            width: ADD_SIZE,
            height: ADD_SIZE,
            borderRadius: Radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: added ? colors.success : colors.surface,
            ...shadow.sm,
          }}
        >
          {adding ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : added ? (
            <Check size={17} color={colors.textInverse} strokeWidth={3} />
          ) : (
            <Plus size={17} color={colors.text} strokeWidth={2.5} />
          )}
        </Pressable>
      )}
    </Animated.View>
  );
}
