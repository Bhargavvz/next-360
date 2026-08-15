import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from './Text';

/**
 * Category tile.
 *
 * Categories have no artwork in the catalogue yet, and rendering the same leaf
 * glyph for all of them read as unfinished. Instead each tile takes a stable
 * tint derived from its name and shows its initial set in the display face — so
 * the row looks deliberate and, more usefully, the tiles are distinguishable
 * from one another at a glance. A real image is used the moment one exists.
 */
const TINTS = ['organic', 'seal', 'eco', 'natural'] as const;

function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

export function CategoryTile({
  name,
  imageUrl,
  onPress,
  size = 64,
  style,
}: {
  name: string;
  imageUrl?: string | null;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();

  const palette = {
    organic: { bg: colors.organicMuted, fg: colors.organic },
    seal: { bg: colors.sealMuted, fg: colors.seal },
    eco: { bg: colors.ecoMuted, fg: colors.eco },
    natural: { bg: colors.naturalMuted, fg: colors.natural },
  }[tintFor(name)];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={[{ width: size + 14, alignItems: 'center', gap: Spacing[2] }, style]}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: Radius.full,
          backgroundColor: palette.bg,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Text
            variant="display"
            style={{ fontSize: size * 0.42, color: palette.fg, lineHeight: size * 0.5 }}
          >
            {name.trim().charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <Text variant="caption" center numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
}
