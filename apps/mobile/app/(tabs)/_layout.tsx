import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, ShoppingBag, Package, User } from 'lucide-react-native';
import { Fonts, Radius, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { useCartStore } from '../../lib/store/cart';

/**
 * Tab item.
 *
 * The active state is a filled pill behind the icon rather than a colour swap
 * alone — at 20px an icon changing hue is easy to miss, while a solid shape
 * appearing is not.
 */
function TabIcon({
  focused,
  Icon,
  label,
  badge,
}: {
  focused: boolean;
  Icon: typeof Home;
  label: string;
  badge?: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ alignItems: 'center', gap: 3, width: 64, paddingTop: 6 }}>
      <View
        style={{
          width: 44,
          height: 28,
          borderRadius: Radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? colors.primaryMuted : 'transparent',
        }}
      >
        <Icon
          size={20}
          color={focused ? colors.primary : colors.textSubtle}
          strokeWidth={focused ? 2.4 : 1.9}
        />

        {badge != null && badge > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: 4,
              minWidth: 17,
              height: 17,
              paddingHorizontal: 4,
              borderRadius: Radius.full,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              // Ring in the bar colour so the badge reads as separate from the icon.
              borderWidth: 2,
              borderColor: colors.surface,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.bodyBold,
                fontSize: 9,
                color: colors.primaryOn,
                lineHeight: 11,
              }}
            >
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        style={{
          fontFamily: focused ? Fonts.bodySemibold : Fonts.body,
          fontSize: Typography['2xs'],
          color: focused ? colors.primary : colors.textSubtle,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { colors, shadow } = useTheme();
  const cartCount = useCartStore((s) => s.totalItems());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 2,
          ...(Platform.OS === 'ios' ? shadow.sm : { elevation: 8 }),
        },
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.selectionAsync().catch(() => {});
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Home} label="Home" />,
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Search} label="Discover" />,
          tabBarAccessibilityLabel: 'Discover',
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={ShoppingBag} label="Cart" badge={cartCount} />
          ),
          tabBarAccessibilityLabel: `Cart, ${cartCount} items`,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={Package} label="Orders" />,
          tabBarAccessibilityLabel: 'Orders',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} Icon={User} label="Profile" />,
          tabBarAccessibilityLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
