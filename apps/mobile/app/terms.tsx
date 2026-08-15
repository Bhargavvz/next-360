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
    heading: 'What Next360 is',
    body: 'Next360 is a marketplace. Sellers list and ship their own products; we verify their certification and handle the transaction. The contract of sale is between you and the seller.',
  },
  {
    heading: 'What "verified organic" means here',
    body:
      'A product carrying the NPOP seal has a certificate on file that our team has checked — number, issuing body, scope and expiry, against that specific listing.\n\n' +
      'A product labelled "Natural" or "Eco-friendly" carries the seller\'s own claim and no organic certificate. We never present the two as equivalent.',
  },
  {
    heading: 'Your account',
    body: 'You sign in with a phone number you control. Keep access to it — anyone who can receive your OTP can reach your account. Tell us at support@next360.in if you lose that number.',
  },
  {
    heading: 'Orders and payment',
    body:
      'Prices include applicable taxes. Stock is reserved when you place an order, not when you add to cart.\n\n' +
      'Online payments are processed by Razorpay. Cash on delivery is available on eligible orders below the stated limit.',
  },
  {
    heading: 'Cancellations and returns',
    body:
      'You can cancel an order yourself until the seller marks it packed; stock goes back on sale and any payment is refunded.\n\n' +
      'For perishables, return requests must be raised within 24 hours of delivery with photographs. Non-perishables follow the seller\'s stated return window.',
  },
  {
    heading: 'Reviews',
    body: 'Only buyers with a delivered order for a product can review it. We remove reviews that are abusive or contain personal information — we do not remove them for being negative.',
  },
  {
    heading: 'Selling on Next360',
    body: 'Sellers must complete KYC before listing, and must hold valid certification for anything listed as organic. Listing an uncertified product as organic ends the account.',
  },
  {
    heading: 'Liability',
    body: 'We are responsible for the platform and for the verification we perform. Product quality, packaging and dispatch are the seller\'s responsibility. Nothing here limits rights you have under Indian consumer law.',
  },
  {
    heading: 'Contact',
    body: 'support@next360.in',
  },
];

export default function TermsScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Terms" variant="close" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], paddingBottom: Spacing[12] }}
      >
        <Text variant="display" style={{ fontSize: 27 }}>
          Terms of service
        </Text>
        <Text variant="caption" tone="subtle" style={{ marginTop: Spacing[1] }}>
          Last updated August 2026
        </Text>

        <LegalDocument sections={SECTIONS} />
      </ScrollView>
    </View>
  );
}
