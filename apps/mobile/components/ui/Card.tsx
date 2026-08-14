import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';

type Variant = 'flat' | 'raised' | 'sunken' | 'accent' | 'seal';
type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends ViewProps {
  variant?: Variant;
  padding?: Padding;
  style?: ViewStyle;
}

const PADDING: Record<Padding, number> = {
  none: 0,
  sm: Spacing[3],
  md: Spacing[4],
  lg: Spacing[5],
};

/** Grouped surface. `flat` is the default — a hairline, no shadow. */
export function Card({ variant = 'flat', padding = 'md', style, ...props }: CardProps) {
  const { colors, shadow } = useTheme();

  const variants: Record<Variant, ViewStyle> = {
    flat: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    raised: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadow.md,
    },
    sunken: {
      backgroundColor: colors.surfaceSunken,
      borderWidth: 1,
      borderColor: colors.border,
    },
    accent: {
      backgroundColor: colors.primaryMuted,
      borderWidth: 1,
      borderColor: colors.primaryBorder,
    },
    seal: {
      backgroundColor: colors.sealMuted,
      borderWidth: 1,
      borderColor: colors.sealBorder,
    },
  };

  return (
    <View
      style={[
        { borderRadius: Radius.xl, padding: PADDING[padding] },
        variants[variant],
        style,
      ]}
      {...props}
    />
  );
}
