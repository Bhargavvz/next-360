import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, Easing } from 'react-native';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';

/**
 * Loading placeholder.
 *
 * Pulses opacity between 0.5 and 1 on the native driver, so it keeps animating
 * smoothly while the JS thread is busy parsing the response that will replace it.
 */
export function Skeleton({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        { backgroundColor: colors.surfaceSunken, borderRadius: Radius.sm, opacity: pulse },
        style,
      ]}
    />
  );
}

/** Matches ProductCard's shape so grids don't reflow when data lands. */
export function ProductCardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={style}>
      <Skeleton style={{ width: '100%', aspectRatio: 1, borderRadius: Radius.xl }} />
      <View style={{ marginTop: Spacing[2.5], gap: Spacing[1.5] }}>
        <Skeleton style={{ height: 9, width: '45%' }} />
        <Skeleton style={{ height: 13, width: '90%' }} />
        <Skeleton style={{ height: 15, width: '40%' }} />
      </View>
    </View>
  );
}

/** Matches the order row shape used on the orders tab. */
export function OrderCardSkeleton({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ flexDirection: 'row', gap: Spacing[3], padding: Spacing[4] }, style]}>
      <Skeleton style={{ width: 56, height: 56, borderRadius: Radius.md }} />
      <View style={{ flex: 1, gap: Spacing[2], justifyContent: 'center' }}>
        <Skeleton style={{ height: 12, width: '50%' }} />
        <Skeleton style={{ height: 14, width: '80%' }} />
        <Skeleton style={{ height: 12, width: '30%' }} />
      </View>
    </View>
  );
}
