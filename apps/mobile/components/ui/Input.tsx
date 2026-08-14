import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { Fonts, Radius, Spacing, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/**
 * Text field.
 *
 * Focus is shown by the border colour plus a tinted ring drawn as a second
 * border layer — React Native has no box-shadow on Android, so the "glow" the
 * web version uses is faked with an outer view.
 */
export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  style,
  containerStyle,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;
  const ringColor = error ? `${colors.error}1F` : focused ? `${colors.primary}1F` : 'transparent';

  return (
    <View style={[{ gap: Spacing[1.5] }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontFamily: Fonts.bodyMedium,
            fontSize: Typography.sm,
            color: colors.text,
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          borderRadius: Radius.lg + 3,
          borderWidth: 3,
          borderColor: ringColor,
          margin: -3,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing[2.5],
            height: 52,
            paddingHorizontal: Spacing[4],
            borderRadius: Radius.lg,
            borderWidth: 1.5,
            borderColor,
            backgroundColor: colors.surface,
          }}
        >
          {leftIcon}
          <TextInput
            style={[
              {
                flex: 1,
                fontFamily: Fonts.body,
                fontSize: Typography.md,
                color: colors.text,
                // Removes the extra vertical padding Android adds by default.
                paddingVertical: 0,
              },
              style as any,
            ]}
            placeholderTextColor={colors.textSubtle}
            selectionColor={colors.primary}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon}
        </View>
      </View>

      {error ? (
        <Text style={{ fontFamily: Fonts.body, fontSize: Typography.xs, color: colors.error }}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={{ fontFamily: Fonts.body, fontSize: Typography.xs, color: colors.textSubtle }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
