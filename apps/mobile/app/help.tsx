import React, { useState } from 'react';
import { View, ScrollView, Pressable, Linking, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useScreenInsets } from '../lib/useScreenInsets';
import Constants from 'expo-constants';
import { ChevronDown, Mail, ShieldCheck } from 'lucide-react-native';
import { Radius, Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { Text } from '../components/ui/Text';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScreenHeader } from '../components/ui/ScreenHeader';

// Android needs this opted into before LayoutAnimation does anything.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS: { section: string; items: { q: string; a: string }[] }[] = [
  {
    section: 'Verification',
    items: [
      {
        q: 'What does the gold NPOP seal actually mean?',
        a: 'It means a person on our team read that seller’s NPOP certificate and confirmed its number, issuing body, scope and expiry cover that specific product. It is not an automated keyword match, and it is not the seller vouching for themselves.',
      },
      {
        q: 'How is "Natural" different from "Organic"?',
        a: 'Organic carries a certificate we have verified. Natural and Eco-friendly are the seller’s own claims — the seller is KYC-verified, but there is no organic certificate behind the label. We never present the two as equivalent.',
      },
      {
        q: 'Can I see the certificate myself?',
        a: 'Yes. Open any verified product and tap the certificate ID, or scan the QR code on the pack. You get the certificate number, issuing body and validity dates.',
      },
    ],
  },
  {
    section: 'Orders',
    items: [
      {
        q: 'How do I track my order?',
        a: 'Open the Orders tab and tap the order. The timeline shows exactly which stage it is at.',
      },
      {
        q: 'Can I cancel?',
        a: 'Yes, until the seller marks it packed. Open the order and tap Cancel this order. Stock goes back on sale and any payment is refunded.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Two to five working days depending on where you are. Orders ship directly from the producer, so it varies by seller location.',
      },
    ],
  },
  {
    section: 'Payments',
    items: [
      {
        q: 'What can I pay with?',
        a: 'UPI, cards, netbanking and wallets through Razorpay, or cash on delivery on eligible orders.',
      },
      {
        q: 'My payment failed but money left my account.',
        a: 'Failed payments are auto-reversed by your bank, usually within 5–7 working days. Your order stays saved and unpaid — you can retry from the order screen without placing it again.',
      },
      {
        q: 'Do you store my card details?',
        a: 'No. Payments happen entirely inside Razorpay. Card and UPI details never reach our servers.',
      },
    ],
  },
];

function FaqRow({ q, a, last }: { q: string; a: string; last: boolean }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => {
        // Cheap, native-feeling expand without pulling in a gesture library.
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen((v) => !v);
      }}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      style={{
        paddingVertical: Spacing[3.5],
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
        <Text variant="bodyMedium" style={{ flex: 1 }}>
          {q}
        </Text>
        <ChevronDown
          size={17}
          color={colors.textSubtle}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </View>
      {open && (
        <Text variant="body" tone="secondary" style={{ marginTop: Spacing[2] }}>
          {a}
        </Text>
      )}
    </Pressable>
  );
}

export default function HelpScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const supportEmail = Constants.expoConfig?.extra?.supportEmail ?? 'support@next360.in';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <ScreenHeader title="Help" variant="close" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[5], gap: Spacing[5], paddingBottom: Spacing[12] }}
      >
        <View>
          <Text variant="display" style={{ fontSize: 26 }}>
            How can we help?
          </Text>
          <Text variant="body" tone="secondary" style={{ marginTop: Spacing[2] }}>
            The questions we get asked most.
          </Text>
        </View>

        {FAQS.map((group) => (
          <View key={group.section} style={{ gap: Spacing[2] }}>
            <Text variant="eyebrow" tone="primary">
              {group.section}
            </Text>
            <Card padding="md" style={{ paddingVertical: 0 }}>
              {group.items.map((item, i) => (
                <FaqRow
                  key={item.q}
                  q={item.q}
                  a={item.a}
                  last={i === group.items.length - 1}
                />
              ))}
            </Card>
          </View>
        ))}

        <Card variant="accent" padding="md" style={{ gap: Spacing[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text variant="bodyMedium">Still stuck?</Text>
          </View>
          <Text variant="caption" tone="secondary">
            Email us with your order number and we&rsquo;ll come back within one working day.
          </Text>
          <Button
            size="md"
            fullWidth
            leftIcon={<Mail size={16} color={colors.primaryOn} />}
            onPress={() => Linking.openURL(`mailto:${supportEmail}`)}
          >
            Email support
          </Button>
        </Card>
      </ScrollView>
    </View>
  );
}
