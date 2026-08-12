import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../lib/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.date}>Last Updated: August 2026</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using the Next360 app and services, you agree to be bound by these Terms. If you do not agree to all the terms and conditions, then you may not access the app or use any services.
        </Text>

        <Text style={styles.sectionTitle}>2. Use of the App</Text>
        <Text style={styles.paragraph}>
          You are responsible for your use of the app and for any content you provide, including compliance with applicable laws, rules, and regulations.
        </Text>

        <Text style={styles.sectionTitle}>3. Purchases and Payments</Text>
        <Text style={styles.paragraph}>
          We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available. We do not guarantee that the colors, features, specifications, and details will be accurate, complete, reliable, current, or free of other errors.
        </Text>

        <Text style={styles.sectionTitle}>4. Disclaimer</Text>
        <Text style={styles.paragraph}>
          The app is provided on an AS-IS and AS-AVAILABLE basis. You agree that your use of the app and our services will be at your sole risk.
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
