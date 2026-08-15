import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, X } from 'lucide-react-native';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from './Text';

/**
 * Standard screen header: back affordance, centred title, optional trailing slot.
 *
 * The title is centred against a fixed-width spacer on the right rather than
 * `flex: 1` alone, so it stays optically centred whether or not there is a
 * trailing action — otherwise it shifts when one appears.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  variant = 'back',
  right,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  /** `close` for modally-presented screens, `back` for pushed ones. */
  variant?: 'back' | 'close';
  right?: React.ReactNode;
}) {
  const { colors } = useTheme();
  const Icon = variant === 'close' ? X : ArrowLeft;

  const goBack = () =>
    onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/(tabs)');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing[5],
        paddingVertical: Spacing[3],
      }}
    >
      <Pressable
        onPress={goBack}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={variant === 'close' ? 'Close' : 'Go back'}
        style={{
          width: 38,
          height: 38,
          borderRadius: Radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceSunken,
        }}
      >
        <Icon size={18} color={colors.textSecondary} />
      </Pressable>

      <View style={{ flex: 1, alignItems: 'center' }}>
        {title && (
          <Text variant="displaySm" numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="caption" tone="subtle">
            {subtitle}
          </Text>
        )}
      </View>

      <View style={{ width: 38, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
