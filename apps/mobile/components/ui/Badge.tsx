import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../lib/theme';

type Variant = 'organic' | 'natural' | 'eco' | 'success' | 'warning' | 'error' | 'default' | 'pending' | 'approved' | 'rejected';

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

const variantConfig: Record<Variant, { bg: string; text: string; border: string }> = {
  organic:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  natural:  { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  eco:      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  success:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  approved: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  warning:  { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  pending:  { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  error:    { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  rejected: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  default:  { bg: Colors.gray100, text: Colors.gray600, border: Colors.gray200 },
};

export function Badge({ children, variant = 'default', icon, size = 'md' }: BadgeProps) {
  const cfg = variantConfig[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          paddingHorizontal: isSmall ? Spacing[1.5] : Spacing[2],
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          { color: cfg.text, fontSize: isSmall ? Typography.xs : 12 },
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 3,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
