import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from './Text';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * Modal sheet anchored to the bottom edge.
 *
 * Slides in with a spring while the backdrop fades — the two run in parallel so
 * the sheet feels attached to the scrim rather than arriving after it. The grab
 * handle is decorative but load-bearing: it is what tells people the sheet can
 * be dismissed.
 */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { colors } = useTheme();

  const translateY = useRef(new Animated.Value(height)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      visible
        ? Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 22,
            stiffness: 220,
          })
        : Animated.timing(translateY, {
            toValue: height,
            duration: 220,
            useNativeDriver: true,
          }),
      Animated.timing(backdrop, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, height, translateY, backdrop]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={{ ...StyleSheetAbsolute, opacity: backdrop }}>
          <Pressable
            style={{ flex: 1, backgroundColor: colors.scrim }}
            onPress={onClose}
            accessibilityLabel="Close"
          />
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY }],
            backgroundColor: colors.surface,
            borderTopLeftRadius: Radius['2xl'],
            borderTopRightRadius: Radius['2xl'],
            paddingBottom: insets.bottom + Spacing[5],
            maxHeight: height * 0.85,
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: Spacing[3] }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: Radius.full,
                backgroundColor: colors.borderStrong,
              }}
            />
          </View>

          {title && (
            <Text variant="displaySm" style={{ paddingHorizontal: Spacing[5], paddingTop: Spacing[4] }}>
              {title}
            </Text>
          )}

          <View style={{ paddingHorizontal: Spacing[5], paddingTop: Spacing[2] }}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const StyleSheetAbsolute = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
