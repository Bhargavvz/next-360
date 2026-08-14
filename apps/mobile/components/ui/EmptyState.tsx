import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from './Text';
import { Button } from './Button';

/**
 * Empty state.
 *
 * The icon sits in a tinted disc — a bare outline icon at this size reads as a
 * failed image. Copy is always a full sentence saying what to do next.
 */
export function EmptyState({
  icon,
  title,
  subtitle,
  action,
  secondaryAction,
  style,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
  style?: ViewStyle;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing[8],
          paddingVertical: Spacing[12],
          gap: Spacing[2],
        },
        style,
      ]}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: Radius.full,
          backgroundColor: colors.primaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing[3],
        }}
      >
        {icon}
      </View>

      <Text variant="displaySm" center>
        {title}
      </Text>

      {subtitle && (
        <Text variant="body" tone="secondary" center style={{ maxWidth: 300 }}>
          {subtitle}
        </Text>
      )}

      {(action || secondaryAction) && (
        <View style={{ marginTop: Spacing[5], gap: Spacing[2.5], alignItems: 'center' }}>
          {action && (
            <Button size="md" onPress={action.onPress}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button size="md" variant="ghost" onPress={secondaryAction.onPress}>
              {secondaryAction.label}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
