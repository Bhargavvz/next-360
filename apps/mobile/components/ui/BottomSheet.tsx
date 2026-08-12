import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../../lib/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoint?: number;
}

export function BottomSheet({ visible, onClose, title, children, snapPoint }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 600, duration: 250, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + Spacing[4], transform: [{ translateY }] },
          snapPoint ? { maxHeight: snapPoint } : undefined,
        ]}
      >
        {/* Drag indicator */}
        <View style={styles.handle} />

        {/* Header */}
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeBtn}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingTop: Spacing[2],
    paddingHorizontal: Spacing[5],
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 16 },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.gray300,
    alignSelf: 'center',
    marginBottom: Spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  closeBtn: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.primary,
  },
});
