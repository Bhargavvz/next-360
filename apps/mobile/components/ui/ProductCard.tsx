import React, { useRef, useState } from 'react';
import { Animated, Pressable, View, ViewStyle, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Leaf, Plus, Check } from 'lucide-react-native';
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

interface Props {
  product: ProductCardData;
  /** `grid` for two-up browse, `rail` for horizontal carousels. */
  layout?: 'grid' | 'rail';
  onAdd?: (product: ProductCardData) => Promise<void> | void;
  style?: ViewStyle;
}

/**
 * Product tile.
 *
 * The add button sits on the image corner (the Blinkit/Zepto convention) rather
 * than under the price — below the copy it collides with the price line and
 * costs a row of vertical space in an already dense grid.
 */
export function ProductCard({ product, layout = 'grid', onAdd, style }: Props) {
  const { colors, shadow } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
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
      // The caller surfaces the error; the card just returns to its resting state.
    } finally {
      setAdding(false);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40 }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()
        }
        accessibilityRole="button"
        accessibilityLabel={product.name}
      >
        {/* Image */}
        <View
          style={{
            aspectRatio: layout === 'rail' ? 1 : 1,
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
              // Fades in from the blur placeholder instead of popping, which
              // keeps a scrolling grid from flashing.
              transition={220}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={30} color={colors.borderStrong} strokeWidth={1.25} />
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

          {/* Add */}
          {onAdd && inStock && (
            <Pressable
              onPress={handleAdd}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to cart`}
              style={{
                position: 'absolute',
                right: Spacing[2],
                bottom: Spacing[2],
                width: 34,
                height: 34,
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
        <View style={{ marginTop: Spacing[2.5], gap: 2 }}>
          {product.sellerName && (
            <Text variant="eyebrow" tone="subtle" numberOfLines={1}>
              {product.sellerName}
            </Text>
          )}
          <Text variant="label" numberOfLines={2}>
            {product.name}
          </Text>
          <Price value={product.price} mrp={product.mrp} size="sm" style={{ marginTop: 2 }} />
        </View>
      </Pressable>
    </Animated.View>
  );
}
