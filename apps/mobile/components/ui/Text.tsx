import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Fonts, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';

type Variant =
  | 'display'      // Fraunces — screen titles only
  | 'displaySm'
  | 'title'        // section headings
  | 'body'
  | 'bodyMedium'
  | 'label'
  | 'caption'
  | 'eyebrow'      // small caps category label
  | 'mono';        // certificate ids

type Tone = 'default' | 'secondary' | 'subtle' | 'primary' | 'seal' | 'error' | 'success' | 'inverse';

interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  center?: boolean;
}

const VARIANTS: Record<Variant, TextStyle> = {
  display: {
    fontFamily: Fonts.displayBold,
    fontSize: Typography['3xl'],
    lineHeight: Typography['3xl'] * 1.15,
    letterSpacing: -0.5,
  },
  displaySm: {
    fontFamily: Fonts.display,
    fontSize: Typography.xl,
    lineHeight: Typography.xl * 1.25,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: Fonts.bodySemibold,
    fontSize: Typography.md,
    lineHeight: Typography.md * 1.35,
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: Typography.base,
    lineHeight: Typography.base * 1.5,
  },
  bodyMedium: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.base,
    lineHeight: Typography.base * 1.5,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: Typography.sm,
    lineHeight: Typography.sm * 1.4,
  },
  caption: {
    fontFamily: Fonts.body,
    fontSize: Typography.xs,
    lineHeight: Typography.xs * 1.4,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemibold,
    fontSize: Typography['2xs'],
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  mono: {
    // System monospace — bundling a mono face for a handful of ids is not worth
    // the download size on mobile.
    fontFamily: 'Menlo',
    fontSize: Typography.xs,
    letterSpacing: -0.2,
  },
};

/**
 * Typed text primitive.
 *
 * Screens should never set fontFamily/fontSize inline — going through variants
 * is what keeps the type scale consistent and makes the Fraunces/Inter split
 * automatic.
 */
export function Text({ variant = 'body', tone = 'default', center, style, ...props }: TextProps) {
  const { colors } = useTheme();

  const TONES: Record<Tone, string> = {
    default: colors.text,
    secondary: colors.textSecondary,
    subtle: colors.textSubtle,
    primary: colors.primary,
    seal: colors.seal,
    error: colors.error,
    success: colors.success,
    inverse: colors.textInverse,
  };

  return (
    <RNText
      style={[
        VARIANTS[variant],
        { color: TONES[tone] },
        center && { textAlign: 'center' },
        style,
      ]}
      {...props}
    />
  );
}
