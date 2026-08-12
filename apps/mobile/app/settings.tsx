import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Linking, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAuthStore } from '../lib/auth';
import { Colors, Spacing, Typography, Radius } from '../lib/theme';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';

const PRIVACY_URL = Constants.expoConfig?.extra?.privacyPolicyUrl ?? 'https://next360.in/privacy';
const TERMS_URL = Constants.expoConfig?.extra?.termsUrl ?? 'https://next360.in/terms';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthStore();
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(false);
  const [newsNotifs, setNewsNotifs] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Contact Support', 'Please email privacy@next360.in to request account deletion.'),
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={{ width: 36, alignItems: 'center' }}>
            <ArrowLeft size={22} color={Colors.gray800} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing[4], gap: Spacing[4], paddingBottom: 40 }}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {[
            { label: 'Order Updates', sub: 'Shipping, delivery, and cancellation', value: orderNotifs, set: setOrderNotifs },
            { label: 'Promotions', sub: 'Offers, coupons, and deals', value: promoNotifs, set: setPromoNotifs },
            { label: 'News & Updates', sub: 'New products, seasonal sales', value: newsNotifs, set: setNewsNotifs },
          ].map((item) => (
            <View key={item.label} style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Text style={styles.toggleSub}>{item.sub}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.set}
                trackColor={{ false: Colors.gray200, true: Colors.primaryLight }}
                thumbColor={item.value ? Colors.primary : Colors.white}
              />
            </View>
          ))}
        </View>

        {/* Privacy & Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Legal</Text>
          {[
            { label: 'Privacy Policy', action: () => Linking.openURL(PRIVACY_URL) },
            { label: 'Terms of Service', action: () => Linking.openURL(TERMS_URL) },
            { label: 'Data & Privacy', action: () => Linking.openURL(PRIVACY_URL + '#data') },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.action}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={20} color={Colors.gray300} />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>Next360 Organic Marketplace</Text>
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.error }]}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteBtnText}>Delete My Account</Text>
          </TouchableOpacity>
          <Text style={styles.deleteHint}>
            Permanently deletes your account and all personal data in accordance with our Privacy Policy.
          </Text>
        </View>
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
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
  section: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[4], gap: Spacing[3],
  },
  sectionTitle: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3] },
  toggleLabel: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.gray900 },
  toggleSub: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 2 },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuLabel: { fontSize: Typography.base, color: Colors.gray800 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: Typography.sm, color: Colors.gray500 },
  infoValue: { fontSize: Typography.sm, color: Colors.gray700, fontWeight: Typography.medium },
  deleteBtn: {
    backgroundColor: Colors.errorLight, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: '#fecaca',
    paddingVertical: Spacing[3], alignItems: 'center',
  },
  deleteBtnText: { fontSize: Typography.base, color: Colors.error, fontWeight: Typography.semibold },
  deleteHint: { fontSize: Typography.xs, color: Colors.gray400, lineHeight: 18, textAlign: 'center' },
});
