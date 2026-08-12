import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon = '📦', title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && (
        <Button onPress={action.onPress} size="md" style={{ marginTop: Spacing[2] } as any}>
          {action.label}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[12],
    gap: Spacing[3],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 20,
  },
});
