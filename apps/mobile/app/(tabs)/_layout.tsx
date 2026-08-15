import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Animated, Platform, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Home, Search, ShoppingBag, Package, User } from 'lucide-react-native';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { Fonts, Radius, Spacing, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { useCartStore } from '../../lib/store/cart';

const TABS = [
  { name: 'index', label: 'Home', Icon: Home },
  { name: 'discover', label: 'Discover', Icon: Search },
  { name: 'cart', label: 'Cart', Icon: ShoppingBag },
  { name: 'orders', label: 'Orders', Icon: Package },
  { name: 'profile', label: 'Profile', Icon: User },
] as const;

/**
 * A single tab.
 *
 * The active state animates three things together — the pill scales in, the icon
 * lifts, and the label gains weight. Changing only the tint left the selected tab
 * hard to spot at 20px; motion plus a solid shape makes it unmissable without
 * shouting.
 */
function TabButton({
  focused,
  Icon,
  label,
  badge,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  Icon: typeof Home;
  label: string;
  badge?: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [focused, anim]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={badge ? `${label}, ${badge} items` : label}
      // The whole column is the touch target, not just the icon.
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing[2] }}
    >
      <View style={{ height: 32, justifyContent: 'center' }}>
        {/* Pill grows out of the centre rather than fading, so the selection
            reads as moving between tabs. */}
        <Animated.View
          style={{
            position: 'absolute',
            alignSelf: 'center',
            width: 52,
            height: 30,
            borderRadius: Radius.full,
            backgroundColor: colors.primaryMuted,
            opacity: anim,
            transform: [{ scaleX: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        />

        <Animated.View
          style={{
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
            ],
          }}
        >
          <Icon
            size={21}
            color={focused ? colors.primary : colors.textSubtle}
            strokeWidth={focused ? 2.4 : 1.8}
          />
        </Animated.View>

        {badge != null && badge > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -1,
              right: -10,
              minWidth: 18,
              height: 18,
              paddingHorizontal: 4,
              borderRadius: Radius.full,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              // Ring in the bar colour so the badge separates from the icon.
              borderWidth: 2,
              borderColor: colors.surface,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.bodyBold,
                fontSize: 9,
                lineHeight: 11,
                color: colors.primaryOn,
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
          marginTop: 2,
          fontFamily: focused ? Fonts.bodySemibold : Fonts.body,
          fontSize: Typography['2xs'],
          color: focused ? colors.primary : colors.textSubtle,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Structural type for the slice of the tab-bar props actually used.
 *
 * `@react-navigation/bottom-tabs` is a transitive dependency of expo-router, not
 * a direct one, so importing its types would couple this file to a package the
 * app does not declare. These four fields are the whole contract.
 */
interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented: boolean };
  };
}

/**
 * Custom tab bar.
 *
 * Replaces the default because the stock bar cannot lay out an animated
 * indicator per tab, and because its bottom padding collapses to zero on devices
 * without a home indicator — which put the icons hard against the screen edge.
 */
function TabBar({ state, navigation }: TabBarProps) {
  const insets = useScreenInsets();
  const { colors, shadow } = useTheme();
  const cartCount = useCartStore((s) => s.totalItems());

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: insets.bottom,
        paddingHorizontal: Spacing[2],
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...(Platform.OS === 'ios' ? shadow.md : { elevation: 12 }),
      }}
    >
      {state.routes.map((route, index) => {
        const config = TABS.find((t) => t.name === route.name);
        if (!config) return null;

        const focused = state.index === index;

        const onPress = () => {
          if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton
            key={route.key}
            focused={focused}
            Icon={config.Icon}
            label={config.label}
            badge={route.name === 'cart' ? cartCount : undefined}
            onPress={onPress}
            onLongPress={() =>
              navigation.emit({ type: 'tabLongPress', target: route.key })
            }
          />
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as unknown as TabBarProps)} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
      ))}
    </Tabs>
  );
}
