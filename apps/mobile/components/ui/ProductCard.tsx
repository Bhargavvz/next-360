import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../lib/theme';
import { Badge } from './Badge';
import { Heart, Star } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface Product {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  price: number;
  mrp?: number;
  rating?: number;
  reviewCount?: number;
  sellerName?: string;
  categoryName?: string;
  inStock?: boolean;
  verifiedOrganic?: boolean;
  productType?: 'ORGANIC' | 'NATURAL' | 'ECO_FRIENDLY';
}

interface ProductCardProps {
  product: Product;
  onWishlistToggle?: (id: string) => void;
  isWishlisted?: boolean;
  onAddToCart?: (product: Product) => void;
}

/** Vertical grid card (used in 2-column grids) */
export function ProductCard({ product, onWishlistToggle, isWishlisted, onAddToCart }: ProductCardProps) {
  const discount = product.mrp && product.mrp > product.price
    ? Math.round((1 - product.price / product.mrp) * 100)
    : 0;

  return (
    <TouchableOpacity
      style={[styles.card, Shadow.sm]}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${product.slug}`)}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>No Image</Text>
          </View>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}

        {/* Out of stock overlay */}
        {product.inStock === false && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* Wishlist button */}
        {onWishlistToggle && (
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => onWishlistToggle(product.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart 
              size={16} 
              color={isWishlisted ? Colors.error : Colors.gray400} 
              fill={isWishlisted ? Colors.error : 'transparent'} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Type badge */}
        {product.productType && (
          <Badge
            variant={product.productType === 'ORGANIC' ? 'organic' : product.productType === 'NATURAL' ? 'natural' : 'eco'}
            size="sm"
          >
            {product.productType === 'ORGANIC' ? 'Organic' : product.productType === 'NATURAL' ? 'Natural' : 'Eco'}
          </Badge>
        )}

        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {product.sellerName && (
          <Text style={styles.seller} numberOfLines={1}>{product.sellerName}</Text>
        )}

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
          {product.mrp && product.mrp > product.price && (
            <Text style={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</Text>
          )}
        </View>

        {/* Rating */}
        {product.rating && (
          <View style={styles.ratingRow}>
            <Star size={11} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
            {product.reviewCount ? (
              <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Add to cart */}
      {onAddToCart && product.inStock !== false && (
        <TouchableOpacity
          style={styles.addToCart}
          onPress={() => onAddToCart(product)}
          activeOpacity={0.7}
        >
          <Text style={styles.addToCartText}>+ Add</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

/** Horizontal list card (used in strips) */
export function ProductListCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <TouchableOpacity
      style={[styles.listCard, Shadow.sm]}
      activeOpacity={0.85}
      onPress={() => router.push(`/product/${product.slug}`)}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.listImage} resizeMode="cover" />
      ) : (
        <View style={[styles.listImage, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      )}
      <View style={styles.listInfo}>
        <Text style={styles.listName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
        {product.sellerName && <Text style={styles.seller} numberOfLines={1}>{product.sellerName}</Text>}
      </View>
      {onAddToCart && product.inStock !== false && (
        <TouchableOpacity style={styles.listAddBtn} onPress={() => onAddToCart(product)}>
          <Text style={styles.addToCartText}>+</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1, // Keep it perfectly square regardless of width
    backgroundColor: Colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
  },
  imagePlaceholderText: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing[2],
    left: Spacing[2],
    backgroundColor: Colors.error,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing[1.5],
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.white,
  },
  outOfStock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
  wishlistBtn: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: Radius.full,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: Spacing[2.5],
    gap: Spacing[1],
  },
  name: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    lineHeight: 18,
  },
  seller: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  price: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  mrp: {
    fontSize: Typography.xs,
    color: Colors.gray400,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  reviewCount: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  addToCart: {
    backgroundColor: Colors.primaryMuted,
    marginHorizontal: Spacing[2.5],
    marginBottom: Spacing[2.5],
    borderRadius: Radius.md,
    paddingVertical: Spacing[1.5],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  addToCartText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    width: 220,
  },
  listImage: {
    width: 90,
    height: 90,
  },
  listInfo: {
    flex: 1,
    padding: Spacing[2.5],
    gap: Spacing[1],
    justifyContent: 'center',
  },
  listName: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  listAddBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryMuted,
    borderLeftWidth: 1,
    borderLeftColor: Colors.primaryBorder,
  },
});
