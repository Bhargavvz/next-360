import React, { useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../lib/useScreenInsets';
import { ShieldCheck, FileSearch, Truck, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../lib/auth';
import { Radius, Spacing } from '../lib/theme';
import { useTheme } from '../lib/useTheme';
import { Text } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { LogoMark } from '../components/ui/LogoMark';

/**
 * Three slides, each making one claim.
 *
 * Onboarding earns its place only if it says something the UI cannot. These are
 * the three things that make this marketplace different from any other grocery
 * app — not a feature tour.
 */
const SLIDES = [
  {
    Icon: ShieldCheck,
    eyebrow: 'The problem',
    title: 'Anyone can print\n“organic” on a label.',
    body: 'On most marketplaces that word is a marketing claim with nothing behind it. Nobody checks.',
  },
  {
    Icon: FileSearch,
    eyebrow: 'What we do',
    title: 'So we read the\ncertificate first.',
    body: 'Our team checks the NPOP certificate number, issuing body, scope and expiry against the listing before it ever goes live.',
  },
  {
    Icon: Truck,
    eyebrow: 'What you get',
    title: 'Proof you can\ncheck yourself.',
    body: 'Every verified product shows its certificate. Scan the pack, read the record, then decide. Shipped straight from the producer.',
  },
];

export default function OnboardingScreen() {
  const insets = useScreenInsets();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { setHasSeenOnboarding } = useAuthStore();

  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const finish = async () => {
    await setHasSeenOnboarding();
    router.replace('/(tabs)');
  };

  const next = () => {
    if (last) return void finish();
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  // Derive the page from the offset rather than onViewableItemsChanged, which
  // fires inconsistently mid-swipe and makes the dots stutter.
  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Skip */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
        <LogoMark size={30} />
        {!last && (
          <Pressable onPress={finish} hitSlop={10}>
            <Text variant="label" tone="secondary">
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: Spacing[6], justifyContent: 'center', flex: 1 }}>
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: Radius['2xl'],
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.primaryMuted,
              }}
            >
              <item.Icon size={28} color={colors.primary} strokeWidth={1.8} />
            </View>

            <Text variant="eyebrow" tone="primary" style={{ marginTop: Spacing[7] }}>
              {item.eyebrow}
            </Text>
            <Text variant="display" style={{ marginTop: Spacing[2], fontSize: 32 }}>
              {item.title}
            </Text>
            <Text variant="body" tone="secondary" style={{ marginTop: Spacing[4], maxWidth: 340 }}>
              {item.body}
            </Text>
          </View>
        )}
      />

      {/* Footer */}
      <View
        style={{
          paddingHorizontal: Spacing[6],
          paddingBottom: insets.bottom + Spacing[2],
          gap: Spacing[5],
        }}
      >
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              style={{
                height: 4,
                flex: i === index ? 2.5 : 1,
                borderRadius: Radius.full,
                backgroundColor: i === index ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        <Button
          size="lg"
          fullWidth
          onPress={next}
          rightIcon={<ArrowRight size={17} color={colors.primaryOn} />}
        >
          {last ? 'Start shopping' : 'Next'}
        </Button>
      </View>
    </View>
  );
}
