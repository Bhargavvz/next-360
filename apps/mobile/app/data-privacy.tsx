import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../lib/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function DataPrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data & Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Data & Privacy</Text>
        <Text style={styles.date}>Last Updated: August 2026</Text>

        <Text style={styles.sectionTitle}>Your Data Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to request access to the personal data we hold about you. You can also request that we delete your personal data.
        </Text>

        <Text style={styles.sectionTitle}>Data Deletion</Text>
        <Text style={styles.paragraph}>
          To delete your account and all associated data, you can use the "Delete My Account" option in the Settings menu, or contact us at privacy@next360.in.
        </Text>

        <Text style={styles.sectionTitle}>Contact</Text>
        <Text style={styles.paragraph}>
          If you have any questions or concerns about how we handle your data, please contact our Data Protection Officer at privacy@next360.in.
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
