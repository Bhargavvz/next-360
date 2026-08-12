import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../lib/theme';
import { ShieldCheck, Truck, Sprout, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../lib/auth';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Pure Organic Goodness',
    description: 'NPOP Certified organic products sourced directly from trusted farmers across India.',
    Icon: ShieldCheck,
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    id: '2',
    title: 'Farm to Doorstep',
    description: 'Experience the freshness of nature delivered straight to you without any middlemen.',
    Icon: Sprout,
    color: '#059669',
    bg: '#ecfdf5',
  },
  {
    id: '3',
    title: 'Fast & Secure Delivery',
    description: 'Track your orders in real-time and enjoy quick, reliable, and safe delivery service.',
    Icon: Truck,
    color: '#0d9488',
    bg: '#f0fdfa',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setHasSeenOnboarding } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<Animated.FlatList<any>>(null);

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      const list = slidesRef.current as any;
      const offset = (currentIndex + 1) * SCREEN_WIDTH;
      if (typeof list?.scrollToOffset === 'function') {
        list.scrollToOffset({ offset, animated: true });
      } else if (typeof list?.getNode === 'function') {
        list.getNode().scrollToOffset({ offset, animated: true });
      }
    } else {
      await setHasSeenOnboarding();
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    await setHasSeenOnboarding();
    router.replace('/(tabs)');
  };

  const renderItem = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }, { translateY }], backgroundColor: item.color + '1A' }]}>
          <View style={[styles.iconInner, { backgroundColor: item.bg }]}>
            <item.Icon size={100} color={item.color} strokeWidth={1.5} />
          </View>
        </Animated.View>
        <Animated.View style={[styles.textContainer, { opacity, transform: [{ translateY }] }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Dynamic Background */}
      <Animated.View style={[
        StyleSheet.absoluteFillObject,
        {
          backgroundColor: scrollX.interpolate({
            inputRange: SLIDES.map((_, i) => i * SCREEN_WIDTH),
            outputRange: SLIDES.map(s => s.bg),
          })
        }
      ]} />

      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.FlatList
          ref={slidesRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentIndex(index);
          }}
          renderItem={renderItem}
        />
      </View>

      {/* Footer Surface */}
      <View style={styles.footerWrapper}>
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              const backgroundColor = scrollX.interpolate({
                inputRange: SLIDES.map((_, i) => i * SCREEN_WIDTH),
                outputRange: SLIDES.map(s => s.color),
              });
              return (
                <Animated.View
                  key={i.toString()}
                  style={[styles.dot, { width: dotWidth, opacity, backgroundColor }]}
                />
              );
            })}
          </View>

          {/* Action Button */}
          <Animated.View style={{
            transform: [{
              scale: scrollX.interpolate({
                inputRange: SLIDES.map((_, i) => i * SCREEN_WIDTH),
                outputRange: SLIDES.map((_, i) => i === currentIndex ? 1 : 0.95),
              })
            }]
          }}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: SLIDES[currentIndex].color }]} onPress={handleNext} activeOpacity={0.85}>
              <Text style={styles.actionButtonText}>
                {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ArrowRight size={20} color={Colors.white} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing[6],
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    zIndex: 10,
  },
  skipText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray600,
    letterSpacing: 0.5,
  },
  carouselContainer: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[8],
    paddingBottom: 100, // Make room for the bottom sheet
  },
  iconWrapper: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_WIDTH * 0.75,
    borderRadius: SCREEN_WIDTH * 0.4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[10],
  },
  iconInner: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: SCREEN_WIDTH * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
  },
  title: {
    fontSize: Typography['3xl'],
    fontWeight: '800', // Extra bold
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing[4],
    letterSpacing: -0.5,
  },
  description: {
    fontSize: Typography.base,
    color: Colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 20,
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing[8],
    paddingTop: Spacing[8],
    gap: Spacing[8],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: 18,
    borderRadius: Radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonText: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
