import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/auth';

const MENU_ITEMS = [
  { icon: '📦', label: 'My Orders', route: '/(tabs)/orders' },
  { icon: '❤️', label: 'Wishlist', route: '/(tabs)/wishlist' },
  { icon: '📍', label: 'Saved Addresses', route: '/addresses' },
  { icon: '🔔', label: 'Notifications', route: '/notifications' },
  { icon: '🛡️', label: 'Help & Support', route: '/support' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    api.get('/api/v1/users/me')
      .then(r => setProfile(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', paddingHorizontal: 40 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0fdf4',
            alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0a0a0a', marginBottom: 8, textAlign: 'center' }}>
            Your Profile
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
            Sign in to manage your orders, wishlist, and account settings
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={{ backgroundColor: '#16a34a', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 14, width: '100%', alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#16a34a" size="large" />
      </SafeAreaView>
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0a0a0a', marginBottom: 20 }}>Profile</Text>

          {/* Avatar + info */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: '#16a34a',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a' }}>{displayName}</Text>
              <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{profile?.phone}</Text>
              {profile?.email && <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{profile.email}</Text>}
              {/* Roles */}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                {(profile?.roles || []).map((r: string) => (
                  <View key={r} style={{
                    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
                    backgroundColor: r === 'SUPER_ADMIN' ? '#f0fdf4' : r === 'SELLER' ? '#fffbeb' : '#f3f4f6',
                  }}>
                    <Text style={{
                      fontSize: 10, fontWeight: '700',
                      color: r === 'SUPER_ADMIN' ? '#166534' : r === 'SELLER' ? '#92400e' : '#6b7280',
                    }}>
                      {r.replace('_', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Orders', icon: '📦' },
              { label: 'Wishlist', icon: '❤️' },
              { label: 'Reviews', icon: '⭐' },
            ].map(s => (
              <View key={s.label} style={{ flex: 1, backgroundColor: '#f9fafb', padding: 12, borderRadius: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}>{s.icon}</Text>
                <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: '500' }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View style={{ backgroundColor: '#fff', marginTop: 8, borderRadius: 16, marginHorizontal: 12, overflow: 'hidden' }}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.route as any)}
              style={{
                flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16,
                borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0, borderBottomColor: '#f3f4f6',
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 14 }}>{item.icon}</Text>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: '#1f2937' }}>{item.label}</Text>
              <Text style={{ fontSize: 16, color: '#d1d5db' }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notifications toggle */}
        <View style={{
          backgroundColor: '#fff', marginTop: 8, borderRadius: 16, marginHorizontal: 12,
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16,
        }}>
          <Text style={{ fontSize: 20, marginRight: 14 }}>🔔</Text>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: '#1f2937' }}>Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#e5e7eb', true: '#16a34a' }}
            thumbColor="#fff"
          />
        </View>

        {/* App info */}
        <View style={{ backgroundColor: '#fff', marginTop: 8, borderRadius: 16, marginHorizontal: 12, padding: 16 }}>
          <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>Next360 v1.0.0 • Made with 💚</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={logout}
          style={{
            margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 16,
            alignItems: 'center', borderWidth: 1, borderColor: '#fecaca',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#ef4444' }}>🚪 Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
