import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../../lib/theme';
import { Check, X, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
}

const config: Record<ToastType, { bg: string; text: string; border: string; Icon: any }> = {
  success: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', Icon: Check },
  error:   { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', Icon: X },
  info:    { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', Icon: Info },
};

export function Toast({ visible, message, type = 'success' }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-100)).current;
  const cfg = config[type];

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 220 }).start();
    } else {
      Animated.timing(translateY, { toValue: -120, duration: 250, useNativeDriver: true }).start();
    }
  }, [visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { top: insets.top + Spacing[3], backgroundColor: cfg.bg, borderColor: cfg.border, transform: [{ translateY }] },
      ]}
    >
      <cfg.Icon size={16} color={cfg.text} />
      <Text style={[styles.message, { color: cfg.text }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

/** Hook for showing toasts imperatively */
export function useToast() {
  const [state, setState] = React.useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const show = React.useCallback((message: string, type: ToastType = 'success') => {
    setState({ visible: true, message, type });
    setTimeout(() => setState((s) => ({ ...s, visible: false })), 3000);
  }, []);

  return { ...state, show };
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: Spacing[4],
    right: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
});
