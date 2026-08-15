import React from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import Constants from 'expo-constants';
import {
  User, Package, Heart, MapPin, Settings, HelpCircle, Shield, FileText,
  LogOut, Bell, ChevronRight, Store, ShieldCheck,
} from 'lucide-react-native';
import { useAuthStore } from '../../lib/auth';
import { useWishlistStore } from '../../lib/store/wishlist';
import { useAddresses, useOrders } from '../../lib/hooks/useOrders';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

function MenuRow({
  Icon,
  label,
  sublabel,
  onPress,
  danger,
  last,
}: {
  Icon: typeof User;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing[3.5],
        paddingVertical: Spacing[3.5],
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: Radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: danger ? colors.errorMuted : colors.surfaceSunken,
        }}
      >
        <Icon size={17} color={danger ? colors.error : colors.textSecondary} strokeWidth={1.9} />
      </View>

      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" tone={danger ? 'error' : 'default'}>
          {label}
        </Text>
        {sublabel && (
          <Text variant="caption" tone="subtle">
            {sublabel}
          </Text>
        )}
      </View>

      {!danger && <ChevronRight size={17} color={colors.textSubtle} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();
  const { items: wishlist } = useWishlistStore();
  const { data: ordersData } = useOrders();
  const { data: addresses = [] } = useAddresses();

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
          <Text variant="display" style={{ fontSize: 28 }}>
            Profile
          </Text>
        </View>
        <EmptyState
          icon={<User size={26} color={colors.primary} />}
          title="Sign in to your account"
          subtitle="Track orders, save addresses and keep a wishlist across devices."
          action={{ label: 'Sign in', onPress: () => router.push('/(auth)/login') }}
        />
      </View>
    );
  }

  const orderCount = ordersData?.totalElements ?? 0;
  const isSeller = hasRole('SELLER');
  const initials = (user?.name ?? user?.phone ?? '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const confirmLogout = () =>
    Alert.alert('Sign out', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(tabs)');
        },
      },
    ]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: Spacing[12] }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
        <Text variant="display" style={{ fontSize: 28 }}>
          Profile
        </Text>
      </View>

      {/* Identity */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing[4],
          paddingHorizontal: Spacing[5],
          marginBottom: Spacing[6],
        }}
      >
        <View
          style={{
            width: 62,
            height: 62,
            borderRadius: Radius.full,
            backgroundColor: colors.primaryMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="displaySm" tone="primary">
            {initials}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text variant="displaySm" numberOfLines={1}>
            {user?.name ?? 'Your account'}
          </Text>
          <Text variant="caption" tone="secondary">
            {user?.phone}
          </Text>
          {isSeller && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: 5,
                alignSelf: 'flex-start',
                paddingHorizontal: Spacing[2],
                paddingVertical: 3,
                borderRadius: Radius.xs,
                backgroundColor: colors.primaryMuted,
              }}
            >
              <ShieldCheck size={11} color={colors.primary} />
              <Text variant="eyebrow" tone="primary">
                Seller
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View
        style={{ flexDirection: 'row', gap: Spacing[3], paddingHorizontal: Spacing[5], marginBottom: Spacing[6] }}
      >
        {[
          { label: 'Orders', value: orderCount, Icon: Package, go: () => router.push('/(tabs)/orders') },
          { label: 'Wishlist', value: wishlist.length, Icon: Heart, go: () => router.push('/wishlist') },
          { label: 'Addresses', value: addresses.length, Icon: MapPin, go: () => router.push('/address') },
        ].map((stat) => (
          <Pressable key={stat.label} onPress={stat.go} style={{ flex: 1 }}>
            <Card padding="sm" style={{ alignItems: 'center', gap: 4, paddingVertical: Spacing[3.5] }}>
              <stat.Icon size={18} color={colors.textSecondary} strokeWidth={1.8} />
              <Text variant="displaySm" style={{ fontSize: 19 }}>
                {stat.value}
              </Text>
              <Text variant="caption" tone="subtle">
                {stat.label}
              </Text>
            </Card>
          </Pressable>
        ))}
      </View>

      {/* Seller CTA */}
      {!isSeller && (
        <Pressable
          onPress={() => router.push('/(tabs)/discover')}
          style={{ paddingHorizontal: Spacing[5], marginBottom: Spacing[6] }}
        >
          <Card variant="accent" padding="md" style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
            <Store size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Sell on Next360</Text>
              <Text variant="caption" tone="secondary">
                If you hold the certificate, get the credit for it.
              </Text>
            </View>
            <ChevronRight size={17} color={colors.primary} />
          </Card>
        </Pressable>
      )}

      {/* Account */}
      <View style={{ paddingHorizontal: Spacing[5], marginBottom: Spacing[5] }}>
        <Text variant="eyebrow" tone="subtle" style={{ marginBottom: Spacing[2] }}>
          My account
        </Text>
        <Card padding="md" style={{ paddingVertical: 0 }}>
          <MenuRow Icon={Package} label="My orders" sublabel="Track and manage" onPress={() => router.push('/(tabs)/orders')} />
          <MenuRow Icon={Heart} label="Wishlist" sublabel={`${wishlist.length} saved`} onPress={() => router.push('/wishlist')} />
          <MenuRow
            Icon={MapPin}
            label="Delivery addresses"
            sublabel={addresses.length ? `${addresses.length} saved` : 'Add your first address'}
            onPress={() => router.push('/address')}
          />
          <MenuRow Icon={Bell} label="Notifications" onPress={() => router.push('/notifications')} last />
        </Card>
      </View>

      {/* Support */}
      <View style={{ paddingHorizontal: Spacing[5], marginBottom: Spacing[5] }}>
        <Text variant="eyebrow" tone="subtle" style={{ marginBottom: Spacing[2] }}>
          Support
        </Text>
        <Card padding="md" style={{ paddingVertical: 0 }}>
          <MenuRow Icon={Settings} label="Settings" onPress={() => router.push('/settings')} />
          <MenuRow Icon={HelpCircle} label="Help & support" onPress={() => router.push('/help')} />
          <MenuRow Icon={Shield} label="Privacy policy" onPress={() => router.push('/privacy')} />
          <MenuRow Icon={FileText} label="Terms of service" onPress={() => router.push('/terms')} last />
        </Card>
      </View>

      {/* Sign out */}
      <View style={{ paddingHorizontal: Spacing[5] }}>
        <Card padding="md" style={{ paddingVertical: 0 }}>
          <MenuRow Icon={LogOut} label="Sign out" onPress={confirmLogout} danger last />
        </Card>
      </View>

      <Text variant="caption" tone="subtle" center style={{ marginTop: Spacing[6] }}>
        Next360 v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </ScrollView>
  );
}
