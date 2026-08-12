import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react-native';
import { Colors, Typography } from '../../lib/theme';
import { useCartStore } from '../../lib/store/cart';

function TabIcon({ focused, Icon, label, badge }: { focused: boolean; Icon: any; label: string; badge?: number }) {
  return (
    <View style={tabStyles.iconContainer}>
      <View style={[tabStyles.iconWrapper, focused && tabStyles.iconWrapperActive]}>
        <Icon size={20} color={focused ? Colors.primary : Colors.gray400} />
      </View>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
      {badge != null && badge > 0 && (
        <View style={tabStyles.badge}>
          <Text style={tabStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
    paddingTop: 4,
  },
  iconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primaryMuted,
  },
  icon: {
    fontSize: 20,
    color: Colors.gray400,
  },
  iconActive: {
    color: Colors.primary,
  },
  label: {
    fontSize: 10,
    color: Colors.gray400,
    fontWeight: '500',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '700',
  },
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const cartCount = useCartStore((s) => s.totalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 4,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 8 },
          }),
        },
        tabBarShowLabel: false,
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Home} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Search} label="Discover" />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={ShoppingCart} label="Cart" badge={cartCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Package} label="Orders" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={User} label="Profile" />,
        }}
      />
    </Tabs>
  );
}
