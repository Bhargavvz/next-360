import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../lib/theme';

const FAQS = [
  {
    section: 'Orders',
    items: [
      { q: 'How do I track my order?', a: 'Go to Orders tab and tap on your order to see the real-time status timeline.' },
      { q: 'Can I cancel my order?', a: 'You can cancel orders that are in "Pending" status from the order details page. Once confirmed, cancellation may not be possible.' },
      { q: 'What is the expected delivery time?', a: 'Delivery takes 2–5 business days depending on your location. Metro cities typically receive orders in 2–3 days.' },
    ],
  },
  {
    section: 'Products',
    items: [
      { q: 'Are all products certified organic?', a: 'Products marked with the NPOP Verified badge have been certified by the National Programme for Organic Production.' },
      { q: 'How do I verify a product\'s organic certification?', a: 'Tap the "NPOP Certified" badge on any product page to view the full certificate and verification details.' },
      { q: 'What does "Natural" vs "Organic" mean?', a: '"Organic" products are NPOP certified with no synthetic inputs. "Natural" products use minimal processing without organic certification.' },
    ],
  },
  {
    section: 'Payments & Returns',
    items: [
      { q: 'What payment methods are accepted?', a: 'We currently accept Cash on Delivery (COD) and online payment via UPI/cards at checkout.' },
      { q: 'What is the return policy?', a: 'If you receive a damaged or incorrect product, contact us within 24 hours. We will arrange a replacement or refund.' },
      { q: 'How long do refunds take?', a: 'Refunds are processed within 5–7 business days to your original payment method.' },
    ],
  },
];

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQ} onPress={() => setOpen(!open)} activeOpacity={0.7}>
        <Text style={styles.faqQText}>{question}</Text>
        <Text style={styles.faqChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && <Text style={styles.faqA}>{answer}</Text>}
    </View>
  );
}

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing[4], gap: Spacing[5], paddingBottom: 40 }}>
        {/* Contact CTA */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need more help?</Text>
          <Text style={styles.contactSub}>Our support team is available Mon–Sat, 9am–6pm IST</Text>
          <View style={styles.contactBtns}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('mailto:support@next360.in')}
            >
              <Text style={styles.contactBtnIcon}>✉</Text>
              <Text style={styles.contactBtnText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactBtn, styles.contactBtnWA]}
              onPress={() => Linking.openURL('https://wa.me/919999999999?text=Hi, I need help with my Next360 order')}
            >
              <Text style={styles.contactBtnIcon}>💬</Text>
              <Text style={[styles.contactBtnText, { color: Colors.white }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        {FAQS.map((section) => (
          <View key={section.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.faqCard}>
              {section.items.map((item, i) => (
                <AccordionItem key={i} question={item.q} answer={item.a} />
              ))}
            </View>
          </View>
        ))}

        {/* Report Bug */}
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => Linking.openURL('mailto:bugs@next360.in?subject=Bug Report')}
        >
          <Text style={styles.reportBtnText}>Report a Problem</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backText: { fontSize: 22, color: Colors.gray800, width: 36 },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
  contactCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl,
    padding: Spacing[5], gap: Spacing[3],
  },
  contactTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.white },
  contactSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.8)' },
  contactBtns: { flexDirection: 'row', gap: Spacing[3] },
  contactBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing[2], paddingVertical: Spacing[3],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.lg,
  },
  contactBtnWA: { backgroundColor: '#25D366' },
  contactBtnIcon: { fontSize: 16 },
  contactBtnText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.white },
  sectionTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: Spacing[1], marginBottom: Spacing[2] },
  faqCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  faqItem: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  faqQ: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing[4], gap: Spacing[3],
  },
  faqQText: { flex: 1, fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.gray900 },
  faqChevron: { fontSize: 10, color: Colors.gray400 },
  faqA: { fontSize: Typography.sm, color: Colors.gray600, lineHeight: 22, paddingHorizontal: Spacing[4], paddingBottom: Spacing[4] },
  reportBtn: {
    alignItems: 'center', paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
  },
  reportBtnText: { fontSize: Typography.base, color: Colors.gray600, fontWeight: Typography.medium },
});
