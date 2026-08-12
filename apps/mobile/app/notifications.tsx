import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../lib/theme';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuthStore } from '../lib/auth';

type NotifType = 'order' | 'promo' | 'system';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

// Mock data — replace with real API call
const MOCK_NOTIFS: Notification[] = [
  { id: '1', type: 'order', title: 'Order Shipped', body: 'Your order #A1B2C3 has been shipped!', createdAt: new Date().toISOString(), read: false },
  { id: '2', type: 'promo', title: '20% Off Today', body: 'Use code ORGANIC20 for 20% off organic products', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: '3', type: 'system', title: 'Profile Updated', body: 'Your delivery address has been saved', createdAt: new Date(Date.now() - 172800000).toISOString(), read: true },
];

const NOTIF_ICONS: Record<NotifType, string> = {
  order: '📦',
  promo: '🏷',
  system: '🔔',
};

function groupByDate(notifs: Notification[]) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: { label: string; items: Notification[] }[] = [];
  const map = new Map<string, Notification[]>();

  notifs.forEach((n) => {
    const d = new Date(n.createdAt).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(n);
  });

  map.forEach((items, label) => groups.push({ label, items }));
  return groups;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const groups = groupByDate(MOCK_NOTIFS);
  const unreadCount = MOCK_NOTIFS.filter((n) => !n.read).length;

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 36 }} />
        </View>
        <EmptyState icon="🔐" title="Sign in to view notifications" action={{ label: 'Sign In', onPress: () => router.push('/(auth)/login') }} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}><Text style={styles.unreadBadgeText}>{unreadCount}</Text></View>
        )}
      </View>

      {MOCK_NOTIFS.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications yet" subtitle="Order updates and offers will appear here" />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(g) => g.label}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group }) => (
            <View>
              <Text style={styles.dateLabel}>{group.label}</Text>
              {group.items.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                  activeOpacity={0.75}
                  onPress={() => notif.type === 'order' && router.push('/(tabs)/orders')}
                >
                  <View style={styles.notifIcon}>
                    <Text style={styles.notifIconText}>{NOTIF_ICONS[notif.type]}</Text>
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {!notif.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifBody}>{notif.body}</Text>
                    <Text style={styles.notifTime}>
                      {new Date(notif.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing[3],
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backText: { fontSize: 22, color: Colors.gray800 },
  headerTitle: { flex: 1, fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900 },
  unreadBadge: {
    backgroundColor: Colors.error, borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 2, minWidth: 24, alignItems: 'center',
  },
  unreadBadgeText: { fontSize: Typography.xs, color: Colors.white, fontWeight: Typography.bold },
  list: { padding: Spacing[4], gap: Spacing[2], paddingBottom: 32 },
  dateLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing[2], marginTop: Spacing[2] },
  notifCard: {
    flexDirection: 'row', gap: Spacing[3],
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[4], marginBottom: Spacing[2],
  },
  notifCardUnread: { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryMuted },
  notifIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  notifIconText: { fontSize: 20 },
  notifContent: { flex: 1, gap: 3 },
  notifTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  notifBody: { fontSize: Typography.sm, color: Colors.gray500, lineHeight: 20 },
  notifTime: { fontSize: Typography.xs, color: Colors.gray400 },
});
