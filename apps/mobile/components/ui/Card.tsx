import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  padding?: number;
  radius?: number;
}

export function Card({
  children,
  style,
  shadow = 'sm',
  padding = 16,
  radius = Radius.xl,
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding, borderRadius: radius },
        shadow !== 'none' ? Shadow[shadow] : undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
});
