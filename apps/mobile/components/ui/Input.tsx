import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
          !!error && styles.containerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon ? styles.inputWithLeft : undefined, style as any]}
          placeholderTextColor={Colors.gray400}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={Colors.primary}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing[1.5],
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.gray700,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    minHeight: 52,
    paddingHorizontal: Spacing[4],
  },
  containerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  containerError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.gray900,
    paddingVertical: Spacing[3],
  },
  inputWithLeft: {
    paddingLeft: Spacing[2],
  },
  leftIcon: {
    marginRight: Spacing[2],
  },
  rightIcon: {
    marginLeft: Spacing[2],
  },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    fontWeight: Typography.medium,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
});
