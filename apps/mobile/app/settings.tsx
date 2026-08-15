import React, { useState } from 'react';
import { View, ScrollView, Pressable, Switch, Linking, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../lib/useScreenInsets';
import Constants from 'expo-constants';
import { ChevronRight, Moon, Sun, Smartphone } from 'lucide-react-native';
import { Radius, Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { ScreenHeader } from '../components/ui/ScreenHeader';

export default function SettingsScreen() {
  const insets = useScreenInsets();
  const { colors, isDark } = useTheme();
  const scheme = useColorScheme();

  const [orderNotifs, setOrderNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(false);
  const [newsNotifs, setNewsNotifs] = useState(true);

  const supportEmail = Constants.expoConfig?.extra?.supportEmail ?? 'support@next360.in';

  const NOTIFICATIONS = [
    {
      label: 'Order updates',
      sub: 'Confirmation, dispatch and delivery',
      value: orderNotifs,
      set: setOrderNotifs,
    },
    { label: 'Offers', sub: 'Coupons and seasonal deals', value: promoNotifs, set: setPromoNotifs },
    {
      label: 'New arrivals',
      sub: 'Newly verified producers and products',
      value: newsNotifs,
      set: setNewsNotifs,
    },
  ];

  const LINKS = [
    { label: 'Data & privacy', to: '/data-privacy' },
    { label: 'Privacy policy', to: '/privacy' },
    { label: 'Terms of service', to: '/terms' },
    { label: 'Help & support', to: '/help' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Settings" variant="close" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], gap: Spacing[4], paddingBottom: Spacing[12] }}
      >
        {/* Appearance — read-only. The app follows the OS setting, so offering
            an in-app override that silently loses to the system would mislead. */}
        <Card padding="md" style={{ gap: Spacing[3] }}>
          <Text variant="eyebrow" tone="subtle">
            Appearance
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: Radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surfaceSunken,
              }}
            >
              {isDark ? (
                <Moon size={17} color={colors.textSecondary} />
              ) : (
                <Sun size={17} color={colors.textSecondary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">{isDark ? 'Dark' : 'Light'}</Text>
              <Text variant="caption" tone="subtle">
                Follows your device setting{scheme ? '' : ' (unset)'}
              </Text>
            </View>
            <Smartphone size={16} color={colors.textSubtle} />
          </View>
        </Card>

        {/* Notifications */}
        <Card padding="md" style={{ gap: Spacing[3] }}>
          <Text variant="eyebrow" tone="subtle">
            Notifications
          </Text>
          {NOTIFICATIONS.map((item) => (
            <View
              key={item.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{item.label}</Text>
                <Text variant="caption" tone="subtle">
                  {item.sub}
                </Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.set}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
                ios_backgroundColor={colors.border}
              />
            </View>
          ))}
        </Card>

        {/* Legal & support */}
        <Card padding="md" style={{ paddingVertical: 0 }}>
          {LINKS.map((link, i) => (
            <Pressable
              key={link.to}
              onPress={() => router.push(link.to as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: Spacing[3.5],
                borderBottomWidth: i === LINKS.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {link.label}
              </Text>
              <ChevronRight size={17} color={colors.textSubtle} />
            </Pressable>
          ))}
        </Card>

        <Pressable onPress={() => Linking.openURL(`mailto:${supportEmail}`)}>
          <Text variant="caption" tone="primary" center>
            {supportEmail}
          </Text>
        </Pressable>

        <Text variant="caption" tone="subtle" center>
          Next360 v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
    </View>
  );
}
