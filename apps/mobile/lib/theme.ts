/**
 * Next360 Design System — Theme Tokens
 * Single source of truth for all colors, typography, spacing, and styling constants.
 */

export const Colors = {
  // Brand
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#4ade80',
  primaryMuted: '#f0fdf4',
  primaryBorder: '#bbf7d0',

  // Semantic
  organic: '#16a34a',
  natural: '#d97706',
  eco: '#2563eb',

  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Status
  success: '#16a34a',
  successLight: '#f0fdf4',
  warning: '#d97706',
  warningLight: '#fffbeb',
  error: '#dc2626',
  errorLight: '#fef2f2',
  info: '#2563eb',
  infoLight: '#eff6ff',

  // Surface
  surface: '#ffffff',
  surfaceSecondary: '#f9fafb',
  surfaceTertiary: '#f3f4f6',
  border: '#e5e7eb',
  borderStrong: '#d1d5db',

  // Dark mode surfaces (for future use)
  dark: {
    surface: '#0a0a0a',
    surfaceSecondary: '#1a1a1a',
    border: '#2a2a2a',
  },
} as const;

export const Typography = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Line heights
  lineHeightTight: 1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,

  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export const TabBar = {
  height: 80,
  backgroundColor: '#ffffff',
  activeTint: '#16a34a',
  inactiveTint: '#9ca3af',
} as const;
