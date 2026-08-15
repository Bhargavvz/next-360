import React from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../lib/useScreenInsets';
import { Bell, Package, Tag, ShieldCheck } from 'lucide-react-native';
import { Radius, Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ScreenHeader } from '../components/ui/ScreenHeader';

/**
 * Notification centre.
 *
 * The API has no notification feed endpoint yet, so this renders the empty
 * state with an honest explanation of what will land here, rather than the
 * fabricated sample notifications it used to show.
 */
const UPCOMING = [
  { Icon: Package, label: 'Order updates', detail: 'Dispatch, out-for-delivery and delivered' },
  { Icon: ShieldCheck, label: 'Verification news', detail: 'When a producer you buy from is certified' },
  { Icon: Tag, label: 'Offers', detail: 'Only if you opt in from Settings' },
];

export default function NotificationsScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Notifications" variant="close" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: Spacing[5] }}
      >
        <EmptyState
          icon={<Bell size={26} color={colors.primary} />}
          title="Nothing here yet"
          subtitle="You’re all caught up. Updates about your orders will appear here."
          action={{ label: 'Track an order', onPress: () => router.push('/(tabs)/orders') }}
        />

        <Card padding="md" style={{ gap: Spacing[3], marginTop: Spacing[6] }}>
          <Text variant="eyebrow" tone="subtle">
            What you’ll get here
          </Text>
          {UPCOMING.map(({ Icon, label, detail }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: Radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.surfaceSunken,
                }}
              >
                <Icon size={16} color={colors.textSecondary} strokeWidth={1.9} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{label}</Text>
                <Text variant="caption" tone="subtle">
                  {detail}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}
