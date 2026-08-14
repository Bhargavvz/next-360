import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Fonts, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from './Text';

/** Indian digit grouping (1,20,000). */
export function formatInr(value: number, decimals = false): string {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });
}

const SCALE = {
  sm: { amount: Typography.base, symbol: Typography['2xs'], strike: Typography.xs },
  md: { amount: Typography.lg, symbol: Typography.xs, strike: Typography.sm },
  lg: { amount: Typography['2xl'], symbol: Typography.sm, strike: Typography.base },
  xl: { amount: Typography['3xl'], symbol: Typography.md, strike: Typography.md },
} as const;

/**
 * Price with optional struck MRP.
 *
 * The ₹ is stepped down in size and weight so the number lands first — at equal
 * weight the symbol competes with the digits the shopper is actually scanning.
 */
export function Price({
  value,
  mrp,
  size = 'md',
  style,
}: {
  value: number;
  mrp?: number | null;
  size?: keyof typeof SCALE;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const scale = SCALE[size];
  const discounted = !!mrp && mrp > value;
  const off = discounted ? Math.round(((mrp! - value) / mrp!) * 100) : 0;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text
          style={{
            fontFamily: Fonts.body,
            fontSize: scale.symbol,
            color: colors.textSecondary,
            marginRight: 1,
          }}
        >
          ₹
        </Text>
        <Text
          style={{
            fontFamily: Fonts.bodySemibold,
            fontSize: scale.amount,
            color: colors.text,
          }}
        >
          {formatInr(value)}
        </Text>
      </View>

      {discounted && (
        <>
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: scale.strike,
              color: colors.textSubtle,
              textDecorationLine: 'line-through',
            }}
          >
            ₹{formatInr(mrp!)}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.bodyMedium,
              fontSize: scale.strike,
              color: colors.success,
            }}
          >
            {off}% off
          </Text>
        </>
      )}
    </View>
  );
}
