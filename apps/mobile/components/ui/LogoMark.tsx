import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../lib/useTheme';

/**
 * The Next360 mark — a leaf inside an open ring.
 *
 * The ring is the "360": a closed loop standing for full-circle traceability,
 * broken at the top-right so it reads as motion rather than a generic
 * "certified" stamp. Drawn as geometry so it holds up from 20pt to the app icon.
 */
export function LogoMark({ size = 32, color }: { size?: number; color?: string }) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle
        cx="16"
        cy="16"
        r="14"
        stroke={tint}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="72 16"
        strokeDashoffset="18"
      />
      <Path d="M16 23c0-5 2.5-8.5 7-10-.5 5.5-3 9-7 10Z" fill={tint} />
      <Path d="M16 23c0-4-2-7-5.5-8.5C11 19 13 22 16 23Z" fill={tint} opacity={0.55} />
    </Svg>
  );
}
