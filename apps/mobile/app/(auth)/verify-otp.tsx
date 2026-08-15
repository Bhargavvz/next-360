import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MessageSquare, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../lib/auth';
import { apiErrorMessage } from '../../lib/api';
import { Radius, Spacing, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{
    phone: string;
    resendIn?: string;
    expiresIn?: string;
    devOtp?: string;
  }>();
  const phone = params.phone;

  const insets = useScreenInsets();
  const { colors } = useTheme();
  const { login, requestOtp } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  // Countdowns come from the server so the UI matches what the API enforces.
  const [resendIn, setResendIn] = useState(Number(params.resendIn) || 30);
  const [expiresIn, setExpiresIn] = useState(Number(params.expiresIn) || 300);
  const [devOtp, setDevOtp] = useState(params.devOtp || '');

  const inputRef = useRef<TextInput>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
      setExpiresIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const focus = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(focus);
  }, []);

  const runShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    Animated.sequence(
      [10, -10, 7, -7, 0].map((to) =>
        Animated.timing(shake, { toValue: to, duration: 55, useNativeDriver: true })
      )
    ).start();
  };

  const verify = useCallback(
    async (code: string) => {
      if (code.length !== OTP_LENGTH) return;
      setLoading(true);
      setError('');
      try {
        await login(phone!, code);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.replace('/(tabs)');
      } catch (err) {
        setError(apiErrorMessage(err, 'That code did not work. Please try again.'));
        setOtp('');
        runShake();
        setTimeout(() => inputRef.current?.focus(), 120);
      } finally {
        setLoading(false);
      }
    },
    [login, phone]
  );

  // Auto-submit the moment the last digit lands, including from SMS autofill.
  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    setError('');
    if (digits.length === OTP_LENGTH) void verify(digits);
  };

  const resend = async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const challenge = await requestOtp(phone!);
      setResendIn(challenge?.resendIn ?? 30);
      setExpiresIn(challenge?.expiresIn ?? 300);
      setDevOtp(challenge?.devMode ? challenge.devOtp ?? '' : '');
      setOtp('');
      inputRef.current?.focus();
    } catch (err) {
      // Covers the server-side cooldown and the per-phone rate limit.
      setError(apiErrorMessage(err, 'Could not resend. Please try again.'));
    } finally {
      setResending(false);
    }
  };

  const displayPhone = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '';
  const mmss = `${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingHorizontal: Spacing[5], paddingVertical: Spacing[3] }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityLabel="Go back"
          style={{
            width: 38,
            height: 38,
            borderRadius: Radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceSunken,
          }}
        >
          <ArrowLeft size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: Spacing[6], paddingTop: Spacing[6] }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: Radius.xl,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primaryMuted,
          }}
        >
          <MessageSquare size={24} color={colors.primary} strokeWidth={1.9} />
        </View>

        <Text variant="display" style={{ marginTop: Spacing[5], fontSize: 28 }}>
          Enter the code
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: Spacing[2] }}>
          Sent to <Text variant="bodyMedium">{displayPhone}</Text>
        </Text>

        {/* One hidden field behind six boxes.
            Six real inputs fight the keyboard, break SMS autofill and make
            backspace unpredictable; a single field with a rendered facade keeps
            autofill working and the caret in one place. */}
        <Animated.View
          style={{
            flexDirection: 'row',
            gap: Spacing[2],
            marginTop: Spacing[8],
            transform: [{ translateX: shake }],
          }}
        >
          {Array.from({ length: OTP_LENGTH }).map((_, i) => {
            const char = otp[i];
            const active = i === otp.length;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 58,
                  borderRadius: Radius.lg,
                  borderWidth: 1.5,
                  borderColor: error
                    ? colors.error
                    : char || active
                      ? colors.primary
                      : colors.border,
                  backgroundColor: char ? colors.primaryMuted : colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: Typography.xl, color: colors.text, fontWeight: '600' }}>
                  {char ?? ''}
                </Text>
              </View>
            );
          })}

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            editable={!loading}
            caretHidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0,
            }}
          />
        </Animated.View>

        {!!error && (
          <Text variant="caption" tone="error" center style={{ marginTop: Spacing[3] }}>
            {error}
          </Text>
        )}

        <Button
          size="lg"
          fullWidth
          loading={loading}
          disabled={otp.length !== OTP_LENGTH}
          onPress={() => void verify(otp)}
          style={{ marginTop: Spacing[6] }}
        >
          Verify &amp; continue
        </Button>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: Spacing[4],
          }}
        >
          <Text variant="caption" tone="subtle">
            {expiresIn > 0 ? `Expires in ${mmss}` : 'This code has expired'}
          </Text>

          {resending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : resendIn > 0 ? (
            <Text variant="caption" tone="subtle">
              Resend in {resendIn}s
            </Text>
          ) : (
            <Pressable onPress={resend} hitSlop={8}>
              <Text variant="label" tone="primary">
                Resend code
              </Text>
            </Pressable>
          )}
        </View>

        {/* Only shown when the server reports SMS delivery is switched off. */}
        {!!devOtp && (
          <View
            style={{
              marginTop: Spacing[6],
              paddingVertical: Spacing[3],
              paddingHorizontal: Spacing[4],
              borderRadius: Radius.md,
              backgroundColor: colors.surfaceSunken,
            }}
          >
            <Text variant="caption" tone="secondary" center>
              SMS delivery is off in this environment. Use{' '}
              <Text variant="bodyMedium">{devOtp}</Text>
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
