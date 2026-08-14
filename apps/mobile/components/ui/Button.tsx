import React, { useRef } from 'react';
import {
  Animated,
  ActivityIndicator,
  Pressable,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Fonts, MIN_TOUCH, Radius, Spacing, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';

type Variant = 'primary' | 'seal' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Skip the tap haptic — use for buttons pressed repeatedly, like ± steppers. */
  noHaptic?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const SIZES: Record<Size, { height: number; paddingH: number; fontSize: number; radius: number }> = {
  sm: { height: 38, paddingH: Spacing[3.5], fontSize: Typography.sm, radius: Radius.md },
  md: { height: MIN_TOUCH, paddingH: Spacing[5], fontSize: Typography.base, radius: Radius.lg },
  lg: { height: 54, paddingH: Spacing[6], fontSize: Typography.md, radius: Radius.lg },
};

/**
 * Primary action control.
 *
 * Presses scale to 0.97 with a spring rather than dropping opacity — on a phone,
 * a physical squash reads as a button being pushed, while a fade reads as the
 * screen glitching. A light haptic fires on press for the same reason.
 */
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  noHaptic = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, shadow } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const dims = SIZES[size];
  const isDisabled = disabled || loading;

  const press = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  const palette: Record<Variant, { bg: string; fg: string; border?: string; elevated?: boolean }> = {
    primary: { bg: colors.primary, fg: colors.primaryOn, elevated: true },
    seal: { bg: colors.seal, fg: colors.sealOn, elevated: true },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    outline: { bg: 'transparent', fg: colors.text, border: colors.borderStrong },
    ghost: { bg: 'transparent', fg: colors.textSecondary },
    destructive: { bg: colors.error, fg: colors.textInverse, elevated: true },
  };
  const tone = palette[variant];

  const containerStyle: ViewStyle = {
    height: dims.height,
    paddingHorizontal: dims.paddingH,
    borderRadius: dims.radius,
    backgroundColor: tone.bg,
    borderWidth: tone.border ? 1 : 0,
    borderColor: tone.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: isDisabled ? 0.45 : 1,
    ...(tone.elevated && !isDisabled ? shadow.sm : null),
  };

  const labelStyle: TextStyle = {
    fontFamily: Fonts.bodySemibold,
    fontSize: dims.fontSize,
    color: tone.fg,
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { alignSelf: 'stretch' }, style]}>
      <Pressable
        onPress={() => {
          if (isDisabled) return;
          if (!noHaptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress?.();
        }}
        onPressIn={() => !isDisabled && press(0.97)}
        onPressOut={() => press(1)}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityLabel={accessibilityLabel}
        style={containerStyle}
      >
        {loading ? (
          <ActivityIndicator color={tone.fg} size="small" />
        ) : (
          <>
            {leftIcon}
            {typeof children === 'string' ? (
              <Text style={labelStyle} numberOfLines={1}>
                {children}
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
                {children}
              </View>
            )}
            {rightIcon}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
