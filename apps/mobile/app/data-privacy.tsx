import React, { useState } from 'react';
import { View, ScrollView, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../lib/useScreenInsets';
import Constants from 'expo-constants';
import { Download, Trash2, Mail, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../lib/auth';
import { api, apiErrorMessage } from '../lib/api';
import { Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScreenHeader } from '../components/ui/ScreenHeader';

const COLLECTED = [
  ['Phone number', 'Signing you in and reaching you about an order'],
  ['Name and email', 'Order communication — both optional'],
  ['Delivery addresses', 'Getting your order to the right place'],
  ['Order history', 'Tracking, returns and your receipts'],
];

const NOT_COLLECTED = [
  'Card, UPI or bank details — payments run inside Razorpay',
  'Your location',
  'Your contacts',
  'Your photos, unless you pick one as a profile picture',
];

export default function DataPrivacyScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const { isAuthenticated, logout } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const supportEmail = Constants.expoConfig?.extra?.supportEmail ?? 'support@next360.in';

  const confirmDelete = () => {
    if (!isAuthenticated) {
      Alert.alert('Not signed in', 'Sign in first to delete your account.');
      return;
    }

    // Two-step confirmation: the first alert explains the consequence, the
    // second is the irreversible action. One tap should never delete an account.
    Alert.alert(
      'Delete your account?',
      'Your profile, saved addresses and wishlist are removed permanently. Past orders are kept in anonymised form because tax law requires it.\n\nThis cannot be undone.',
      [
        { text: 'Keep my account', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Last chance', 'Permanently delete your Next360 account?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete permanently', style: 'destructive', onPress: runDelete },
            ]),
        },
      ]
    );
  };

  const runDelete = async () => {
    setDeleting(true);
    try {
      await api.delete('/api/v1/users/me');
      await logout();
      Alert.alert('Account deleted', 'Your account has been removed. Sorry to see you go.');
      router.replace('/(tabs)');
    } catch (err) {
      // The server refuses while an order is still in flight — surface that reason.
      Alert.alert('Could not delete', apiErrorMessage(err, 'Please try again, or contact support.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Data & privacy" variant="close" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], gap: Spacing[4], paddingBottom: Spacing[12] }}
      >
        <View>
          <Text variant="display" style={{ fontSize: 26 }}>
            Your data
          </Text>
          <Text variant="body" tone="secondary" style={{ marginTop: Spacing[2] }}>
            What we hold, why we hold it, and how to get rid of it.
          </Text>
        </View>

        <Card padding="md" style={{ gap: Spacing[3] }}>
          <Text variant="eyebrow" tone="subtle">
            What we collect
          </Text>
          {COLLECTED.map(([what, why]) => (
            <View key={what} style={{ gap: 2 }}>
              <Text variant="bodyMedium">{what}</Text>
              <Text variant="caption" tone="secondary">
                {why}
              </Text>
            </View>
          ))}
        </Card>

        <Card variant="accent" padding="md" style={{ gap: Spacing[2.5] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
            <ShieldCheck size={15} color={colors.primary} />
            <Text variant="eyebrow" tone="primary">
              What we never collect
            </Text>
          </View>
          {NOT_COLLECTED.map((item) => (
            <Text key={item} variant="caption" tone="secondary">
              · {item}
            </Text>
          ))}
        </Card>

        <Card padding="md" style={{ gap: Spacing[3] }}>
          <Text variant="eyebrow" tone="subtle">
            Get a copy
          </Text>
          <Text variant="caption" tone="secondary">
            Request everything we hold about you and we&rsquo;ll send it within 30 days.
          </Text>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            leftIcon={<Download size={16} color={colors.text} />}
            onPress={() =>
              Linking.openURL(
                `mailto:${supportEmail}?subject=${encodeURIComponent('Data export request')}`
              )
            }
          >
            Request my data
          </Button>
        </Card>

        <Card padding="md" style={{ gap: Spacing[3] }}>
          <Text variant="eyebrow" tone="subtle">
            Delete your account
          </Text>
          <Text variant="caption" tone="secondary">
            Removes your profile, addresses and wishlist for good. Past orders are kept in
            anonymised form because tax law requires it.
          </Text>
          <Button
            variant="destructive"
            size="md"
            fullWidth
            loading={deleting}
            leftIcon={<Trash2 size={16} color={colors.textInverse} />}
            onPress={confirmDelete}
          >
            Delete my account
          </Button>
        </Card>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          leftIcon={<Mail size={16} color={colors.textSecondary} />}
          onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
        >
          Contact us about privacy
        </Button>
      </ScrollView>
    </View>
  );
}
