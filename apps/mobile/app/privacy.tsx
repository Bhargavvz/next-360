import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../lib/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: August 2026</Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of Information</Text>
        <Text style={styles.paragraph}>
          We may use the information we collect about you to:
          {'\n'}• Provide, maintain, and improve our Services
          {'\n'}• Process and facilitate transactions and payments
          {'\n'}• Send you support and administrative messages
          {'\n'}• Respond to your comments, questions, and customer service requests
        </Text>

        <Text style={styles.sectionTitle}>3. Sharing of Information</Text>
        <Text style={styles.paragraph}>
          We may share the information we collect about you with vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
  content: { padding: Spacing[6], paddingBottom: 60 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900, marginBottom: Spacing[1] },
  date: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: Spacing[6] },
  sectionTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900, marginTop: Spacing[6], marginBottom: Spacing[2] },
  paragraph: { fontSize: Typography.base, color: Colors.gray700, lineHeight: 24 },
});
