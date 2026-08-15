import React from 'react';
import { View, ScrollView } from 'react-native';
import { useScreenInsets } from '../lib/useScreenInsets';
import { Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { Text } from '../components/ui/Text';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { LegalDocument, type LegalSection } from '../components/LegalDocument';

const SECTIONS: LegalSection[] = [
  {
    heading: 'What we collect',
    body: 'Your phone number (for sign-in), and optionally your name and email. Delivery addresses you save, and the orders you place. That is the whole list.',
  },
  {
    heading: 'What we never collect',
    body: 'We do not store card numbers, UPI IDs or bank details. Payments run entirely inside Razorpay — those details never reach our servers. We do not track your location, read your contacts, or access your photos unless you pick one for a profile picture.',
  },
  {
    heading: 'Why we collect it',
    body:
      'Your phone number identifies your account and receives the one-time code you sign in with.\n\n' +
      'Your address and order history exist so we can deliver what you bought and show you where it is.\n\n' +
      'Your name and email, if you give them, are used for order updates.',
  },
  {
    heading: 'Who we share it with',
    body:
      'Sellers receive the delivery details for the orders they fulfil — name, address and phone — because they ship to you directly.\n\n' +
      'Razorpay processes payments. Delivery partners receive the address needed to complete the drop.\n\n' +
      'We do not sell your data, and we do not share it with advertisers.',
  },
  {
    heading: 'How long we keep it',
    body: 'Order records are retained for as long as tax and consumer-protection law requires. Everything else is deleted when you delete your account.',
  },
  {
    heading: 'Deleting your account',
    body: 'Open Profile → Settings → Data & privacy, or email support@next360.in. We action deletion requests within 30 days and confirm by SMS when it is done.',
  },
  {
    heading: 'Security',
    body: 'All traffic is encrypted in transit. Sign-in tokens are held in the device keychain (iOS) or keystore (Android), never in plain storage.',
  },
  {
    heading: 'Contact',
    body: 'Questions about any of this go to support@next360.in.',
  },
];

export default function PrivacyScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Privacy" variant="close" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], paddingBottom: Spacing[12] }}
      >
        <Text variant="display" style={{ fontSize: 27 }}>
          Privacy policy
        </Text>
        <Text variant="caption" tone="subtle" style={{ marginTop: Spacing[1] }}>
          Last updated August 2026
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: Spacing[4] }}>
          The short version: we collect what is needed to deliver your order, and nothing else.
        </Text>

        <LegalDocument sections={SECTIONS} />
      </ScrollView>
    </View>
  );
}
