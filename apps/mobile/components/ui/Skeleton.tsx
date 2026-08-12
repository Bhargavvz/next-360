import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../lib/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, radius = Radius.md, style }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[styles.skeleton, { width: width as any, height, borderRadius: radius, opacity }, style]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton height={180} radius={12} style={{ marginBottom: 10 }} />
      <Skeleton height={12} width="60%" style={{ marginBottom: 6 }} />
      <Skeleton height={16} width="80%" style={{ marginBottom: 8 }} />
      <Skeleton height={14} width="45%" />
    </View>
  );
}

export function OrderCardSkeleton() {
  return (
    <View style={skeletonStyles.order}>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
        <Skeleton width={48} height={48} radius={10} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton height={14} width="70%" />
          <Skeleton height={12} width="45%" />
        </View>
      </View>
      <Skeleton height={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.gray200,
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  order: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
