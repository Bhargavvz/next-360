import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../lib/theme';

interface AvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  textSize?: number;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function getColor(name: string): string {
  const colors = [
    '#16a34a', '#15803d', '#2563eb', '#d97706', '#7c3aed',
    '#db2777', '#0891b2', '#059669', '#dc2626', '#9333ea',
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, imageUrl, size = 40, textSize }: AvatarProps) {
  const bg = name ? getColor(name) : Colors.gray400;
  const initials = name ? getInitials(name) : '?';
  const fontSize = textSize ?? Math.round(size * 0.38);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: imageUrl ? 'transparent' : bg,
        },
      ]}
    >
      {/* Image (not using expo-image to keep deps simple) */}
      {imageUrl ? (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: bg,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.white,
    fontWeight: Typography.bold,
  },
});
