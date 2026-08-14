import { useColorScheme } from 'react-native';
import { useMemo } from 'react';
import {
  darkPalette,
  lightPalette,
  shadows,
  type Palette,
} from './theme';

export interface Theme {
  colors: Palette;
  isDark: boolean;
  shadow: ReturnType<typeof shadows>;
}

/**
 * The app follows the OS appearance setting.
 *
 * `useColorScheme()` re-renders on change, so screens flip live when the system
 * switches — including on the iOS automatic day/night schedule, which reviewers
 * do check.
 */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return useMemo(
    () => ({
      colors: isDark ? darkPalette : lightPalette,
      isDark,
      shadow: shadows(isDark),
    }),
    [isDark]
  );
}

/**
 * Status-bar content style that always contrasts with the surface behind it.
 * Inverted from the theme: a dark UI needs light glyphs.
 */
export function useStatusBarStyle(): 'light' | 'dark' {
  return useColorScheme() === 'dark' ? 'light' : 'dark';
}
