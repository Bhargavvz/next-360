/**
 * Next360 — Mobile design tokens
 *
 * Mirrors the web design system so the two products feel like one brand:
 *   · Moss  — a deep, grown green (not the stock #16a34a)
 *   · Bone  — warm, yellow-leaning neutrals instead of cool greys
 *   · Seal  — a certification gold used *only* for verified organic proof
 *
 * Both palettes are exported; `useTheme()` picks one from the OS setting.
 * Never import `Colors` directly in a screen — it is the light palette only and
 * will be wrong in dark mode. Use `useTheme()`.
 */

export const lightPalette = {
  // Surfaces
  background: '#FBFAF7',
  surface: '#FFFFFF',
  surfaceSunken: '#F4F1EA',
  surfaceHover: '#F6F4EF',

  // Text
  text: '#1C1917',
  textSecondary: '#6B6459',
  textSubtle: '#928B7E',
  textInverse: '#FBFAF7',

  // Brand
  primary: '#17643F',
  primaryHover: '#0F5233',
  primaryOn: '#FBFAF7',
  primaryMuted: '#EAF5EE',
  primaryBorder: '#BFDDCB',

  // Verification gold — organic proof only
  seal: '#A8760F',
  sealOn: '#FBFAF7',
  sealMuted: '#FBF4E4',
  sealBorder: '#E4CE9B',

  // Classification
  organic: '#17643F',
  organicMuted: '#EAF5EE',
  natural: '#A9530F',
  naturalMuted: '#FBF0E6',
  eco: '#1B6089',
  ecoMuted: '#E7F1F7',

  // Feedback
  success: '#1B7449',
  successMuted: '#EAF5EE',
  warning: '#B26B0B',
  warningMuted: '#FCF3E3',
  error: '#B4372E',
  errorMuted: '#FBECEA',
  info: '#1B6089',
  infoMuted: '#E7F1F7',

  // Lines
  border: '#E6E1D6',
  borderStrong: '#CFC7B7',

  // Scrims
  scrim: 'rgba(28, 25, 23, 0.45)',

  /* ------------------------------------------------------------------
     Compatibility aliases.

     Screens written against the old cool-grey scale keep working, but are
     re-pointed at the warm bone ramp so they still look like the rest of the
     app. These are light-mode values only — a screen using them will not
     adapt to dark mode. Migrate to `useTheme()` and delete the alias.
     ------------------------------------------------------------------ */
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FBFAF7',
  gray100: '#F4F1EA',
  gray200: '#E6E1D6',
  gray300: '#CFC7B7',
  gray400: '#928B7E',
  gray500: '#6B6459',
  gray600: '#575147',
  gray700: '#443F37',
  gray800: '#2E2A25',
  gray900: '#1C1917',
  successLight: '#EAF5EE',
  warningLight: '#FCF3E3',
  errorLight: '#FBECEA',
  infoLight: '#E7F1F7',
  surfaceSecondary: '#F4F1EA',
  surfaceTertiary: '#E6E1D6',
  primaryLight: '#4FA97A',
} as const;

export const darkPalette: Record<keyof typeof lightPalette, string> = {
  // A warm green-black rather than neutral grey, so the brand survives at night.
  background: '#0D110F',
  surface: '#151A17',
  surfaceSunken: '#0A0E0C',
  surfaceHover: '#1D2420',

  text: '#F2EFE8',
  textSecondary: '#A9A398',
  textSubtle: '#807A70',
  textInverse: '#0D110F',

  // The deep moss disappears on a dark ground, so the brand lifts.
  primary: '#5CC48D',
  primaryHover: '#7AD3A3',
  primaryOn: '#0B1710',
  primaryMuted: '#16302250',
  primaryBorder: '#2E5442',

  seal: '#E0B24F',
  sealOn: '#1A1405',
  sealMuted: '#2A220E',
  sealBorder: '#4C3F1D',

  organic: '#5CC48D',
  organicMuted: '#163022',
  natural: '#DD9553',
  naturalMuted: '#2E2015',
  eco: '#5CB2D8',
  ecoMuted: '#15272F',

  success: '#5CC48D',
  successMuted: '#163022',
  warning: '#E0AC53',
  warningMuted: '#2E2415',
  error: '#E0685C',
  errorMuted: '#301A18',
  info: '#5CB2D8',
  infoMuted: '#15272F',

  border: '#252E29',
  borderStrong: '#3A453F',

  scrim: 'rgba(0, 0, 0, 0.6)',

  // Compatibility aliases, inverted for dark. See the note in lightPalette.
  white: '#151A17',
  black: '#F2EFE8',
  gray50: '#0D110F',
  gray100: '#151A17',
  gray200: '#252E29',
  gray300: '#3A453F',
  gray400: '#807A70',
  gray500: '#A9A398',
  gray600: '#BEB8AD',
  gray700: '#D3CDC3',
  gray800: '#E5E0D7',
  gray900: '#F2EFE8',
  successLight: '#163022',
  warningLight: '#2E2415',
  errorLight: '#301A18',
  infoLight: '#15272F',
  surfaceSecondary: '#151A17',
  surfaceTertiary: '#252E29',
  primaryLight: '#7AD3A3',
} as const;

/** Every palette exposes the same keys; values are plain strings. */
export type Palette = Record<keyof typeof lightPalette, string>;

/** Back-compat default export — light palette. Prefer `useTheme()`. */
export const Colors = lightPalette;

export const Typography = {
  // Sizes
  '2xs': 10,
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
  '4xl': 40,

  // Weights (RN needs string literals)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,

  lineHeightTight: 1.2,
  lineHeightNormal: 1.45,
  lineHeightRelaxed: 1.65,
} as const;

/**
 * Font families.
 *
 * Fraunces carries the brand on headings; body copy uses Inter, which is what
 * the web uses too. Both are loaded in the root layout — see `useAppFonts`.
 */
export const Fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** 4pt base scale — every gap in the app is a multiple of 4. */
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
  xs: 6,
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

/**
 * Elevation.
 *
 * Shadows are warm-tinted rather than pure black — neutral shadows over the
 * bone surfaces look muddy. On dark grounds shadows do almost nothing, so depth
 * there comes from surface lightness instead.
 */
export function shadows(isDark: boolean) {
  const color = isDark ? '#000000' : '#2A2016';
  const scale = isDark ? 0.5 : 1;

  return {
    none: {},
    xs: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05 * scale,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07 * scale,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.09 * scale,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: color,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.13 * scale,
      shadowRadius: 24,
      elevation: 10,
    },
  } as const;
}

/** Motion. One easing for everything; durations kept short enough to feel instant. */
export const Motion = {
  fast: 140,
  normal: 220,
  slow: 320,
} as const;

/** Minimum touch target — both stores flag anything smaller in review. */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const MIN_TOUCH = 44;

/**
 * Static shadow presets for screens not yet migrated to `useTheme().shadow`.
 * Light-mode values — prefer the theme-aware version.
 */
export const Shadow = shadows(false);
