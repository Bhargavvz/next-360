import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Platform,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography } from '../../lib/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
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
  style?: ViewStyle;
}

const variantStyles: Record<Variant, { container: object; text: object }> = {
  primary: {
    container: {
      backgroundColor: Colors.primary,
      borderWidth: 0,
    },
    text: { color: Colors.white },
  },
  secondary: {
    container: {
      backgroundColor: Colors.primaryMuted,
      borderWidth: 0,
    },
    text: { color: Colors.primary },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: Colors.border,
    },
    text: { color: Colors.gray800 },
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: { color: Colors.gray700 },
  },
  destructive: {
    container: {
      backgroundColor: Colors.error,
      borderWidth: 0,
    },
    text: { color: Colors.white },
  },
};

const sizeStyles: Record<Size, { container: object; text: object; padding: object }> = {
  sm: {
    container: { borderRadius: Radius.md, height: 36 },
    text: { fontSize: Typography.sm, fontWeight: Typography.medium },
    padding: { paddingHorizontal: Spacing[3] },
  },
  md: {
    container: { borderRadius: Radius.lg, height: 48 },
    text: { fontSize: Typography.base, fontWeight: Typography.semibold },
    padding: { paddingHorizontal: Spacing[5] },
  },
  lg: {
    container: { borderRadius: Radius.xl, height: 56 },
    text: { fontSize: Typography.md, fontWeight: Typography.semibold },
    padding: { paddingHorizontal: Spacing[6] },
  },
};

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
  style,
}: ButtonProps) {
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        vStyle.container,
        sStyle.container,
        sStyle.padding,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? Colors.white : Colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text style={[styles.text, vStyle.text, sStyle.text]} numberOfLines={1}>
            {children}
          </Text>
          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
