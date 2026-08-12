import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../lib/theme';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({ rating, maxStars = 5, size = 16, interactive = false, onRate }: StarRatingProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <TouchableOpacity
            key={i}
            disabled={!interactive}
            onPress={() => onRate?.(i + 1)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Text style={{ fontSize: size, color: filled ? '#f59e0b' : Colors.gray300 }}>
              {filled ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface RatingBarProps {
  distribution: Record<number, number>;
  totalCount: number;
  averageRating: number;
}

export function RatingBar({ distribution, totalCount, averageRating }: RatingBarProps) {
  return (
    <View style={styles.ratingContainer}>
      <View style={styles.averageBlock}>
        <Text style={styles.averageNumber}>{averageRating.toFixed(1)}</Text>
        <StarRating rating={averageRating} size={18} />
        <Text style={styles.totalReviews}>{totalCount} reviews</Text>
      </View>
      <View style={styles.bars}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <View key={star} style={styles.barRow}>
              <Text style={styles.barLabel}>{star}★</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.barCount}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: Spacing[5],
    alignItems: 'center',
  },
  averageBlock: {
    alignItems: 'center',
    gap: Spacing[1],
  },
  averageNumber: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  totalReviews: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  bars: {
    flex: 1,
    gap: Spacing[1],
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  barLabel: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    width: 22,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  barCount: {
    fontSize: Typography.xs,
    color: Colors.gray400,
    width: 20,
    textAlign: 'right',
  },
});
