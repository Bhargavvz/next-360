import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from './theme';

/**
 * Safe-area insets plus the breathing room a screen actually needs.
 *
 * `useSafeAreaInsets()` returns the *untouchable* region — the notch, the status
 * bar, the home indicator. Padding a screen by exactly that value puts the first
 * pixel of content immediately against the status bar, which is what made every
 * screen look jammed into the top edge.
 *
 * These values add a consistent gap on top of the inset, and floor the bottom so
 * devices without a home indicator (where `insets.bottom` is 0) still keep
 * content clear of the screen edge.
 */
export function useScreenInsets() {
  const insets = useSafeAreaInsets();

  return {
    /** Top padding for a screen's first element. */
    top: insets.top + Spacing[3],
    /** Bottom padding for a screen's last element or a pinned bar. */
    bottom: Math.max(insets.bottom, Spacing[3]),
    /** Raw insets, for cases that need the untouchable region exactly. */
    raw: insets,
  };
}
