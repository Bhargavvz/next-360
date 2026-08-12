import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../lib/auth';
import { useWishlistStore } from '../../lib/store/wishlist';
import { useOrders } from '../../lib/hooks/useOrders';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';
import Constants from 'expo-constants';
import {
  User, Package, Heart, MapPin, Settings, HelpCircle,
  Shield, FileText, LogOut, Bell, ChevronRight
} from 'lucide-react-native';

// Removed Linking URLs, using local screens instead

interface MenuItemProps {
  IconComponent: any;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  chevron?: boolean;
}

function MenuItem({ IconComponent, label, sublabel, onPress, danger, chevron = true }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <IconComponent size={20} color={danger ? Colors.error : Colors.gray700} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {chevron && <ChevronRight size={20} color={Colors.gray300} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();
  const { data: ordersData } = useOrders();

  if (!isAuthenticated) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <EmptyState
          icon={<User size={48} color={Colors.gray400} />}
          title="Sign in to your account"
          subtitle="Access your orders, wishlist, and more"
          action={{ label: 'Sign In', onPress: () => router.push('/(auth)/login') }}
        />
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const orderCount = ordersData?.totalElements ?? 0;
  const isSeller = hasRole('SELLER');

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User card */}
      <View style={styles.userCard}>
        <Avatar name={user?.name ?? user?.phone} size={64} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name ?? 'User'}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Orders', value: String(orderCount), Icon: Package, onPress: () => router.push('/(tabs)/orders') },
          { label: 'Wishlist', value: String(wishlistItems.length), Icon: Heart, onPress: () => router.push('/wishlist') },
          { label: 'Addresses', value: '—', Icon: MapPin, onPress: () => router.push('/address/new') },
        ].map((stat) => (
          <TouchableOpacity key={stat.label} style={styles.statItem} onPress={stat.onPress}>
            <stat.Icon size={22} color={Colors.gray700} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Account */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>My Account</Text>
        <View style={styles.menuCard}>
          <MenuItem IconComponent={Package} label="My Orders" sublabel="Track and manage orders" onPress={() => router.push('/(tabs)/orders')} />
          <MenuItem IconComponent={Heart} label="Wishlist" sublabel={`${wishlistItems.length} saved products`} onPress={() => router.push('/wishlist')} />
          <MenuItem IconComponent={MapPin} label="Delivery Addresses" onPress={() => router.push('/address/new')} />
          <MenuItem IconComponent={Bell} label="Notifications" onPress={() => router.push('/notifications')} />
        </View>
      </View>

      {/* Seller section */}
      {!isSeller && (
        <View style={styles.sellerCard}>
          <View style={styles.sellerCardContent}>
            <Text style={styles.sellerCardTitle}>Sell on Next360</Text>
            <Text style={styles.sellerCardSub}>Join 500+ sellers and reach thousands of customers</Text>
          </View>
          <TouchableOpacity
            style={styles.sellerBtn}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.sellerBtnText}>Become a Seller →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* More */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>More</Text>
        <View style={styles.menuCard}>
          <MenuItem IconComponent={Settings} label="Settings" onPress={() => router.push('/settings')} />
          <MenuItem IconComponent={HelpCircle} label="Help & Support" onPress={() => router.push('/help')} />
          <MenuItem IconComponent={Shield} label="Privacy Policy" onPress={() => router.push('/privacy')} />
          <MenuItem IconComponent={FileText} label="Terms of Service" onPress={() => router.push('/terms')} />
        </View>
      </View>

      {/* Logout */}
      <View style={[styles.menuSection, { marginTop: 0 }]}>
        <View style={styles.menuCard}>
          <MenuItem IconComponent={LogOut} label="Sign Out" onPress={handleLogout} danger chevron={false} />
        </View>
      </View>

      {/* Version */}
      <Text style={styles.version}>
        Next360 v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.gray900 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[4],
    backgroundColor: Colors.white,
    margin: Spacing[4],
    padding: Spacing[5],
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.gray900 },
  userPhone: { fontSize: Typography.sm, color: Colors.gray500 },
  userEmail: { fontSize: Typography.sm, color: Colors.gray400 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[2],
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[4],
    gap: Spacing[1],
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statValue: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.gray900 },
  statLabel: { fontSize: Typography.xs, color: Colors.gray400 },
  menuSection: { marginTop: Spacing[4], paddingHorizontal: Spacing[4], gap: Spacing[2] },
  menuSectionTitle: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: Spacing[1] },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3.5],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: Colors.errorLight },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.gray900 },
  menuLabelDanger: { color: Colors.error },
  menuSublabel: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 1 },
  sellerCard: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[2],
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    gap: Spacing[3],
  },
  sellerCardContent: { gap: 4 },
  sellerCardTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  sellerCardSub: { fontSize: Typography.sm, color: 'rgba(255,255,255,0.8)' },
  sellerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.lg,
    paddingVertical: Spacing[2.5],
    paddingHorizontal: Spacing[4],
    alignSelf: 'flex-start',
  },
  sellerBtnText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.white },
  version: {
    textAlign: 'center',
    fontSize: Typography.xs,
    color: Colors.gray400,
    marginTop: Spacing[6],
  },
});
