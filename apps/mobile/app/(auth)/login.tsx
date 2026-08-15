import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { ShieldCheck, FileCheck, Truck, X } from 'lucide-react-native';
import { useAuthStore } from '../../lib/auth';
import { apiErrorMessage } from '../../lib/api';
import { Radius, Spacing, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { LogoMark } from '../../components/ui/LogoMark';

const PROMISES = [
  { Icon: ShieldCheck, label: 'NPOP certificates\nchecked by hand' },
  { Icon: FileCheck, label: 'KYC-verified\nsellers only' },
  { Icon: Truck, label: 'Ships straight\nfrom the source' },
];

export default function LoginScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const requestOtp = useAuthStore((s) => s.requestOtp);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSend = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const challenge = await requestOtp(digits);
      // Pass the server's countdowns through so the next screen shows real
      // numbers rather than a guessed resend delay.
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phone: digits,
          resendIn: String(challenge?.resendIn ?? 30),
          expiresIn: String(challenge?.expiresIn ?? 300),
          devOtp: challenge?.devMode ? challenge.devOtp ?? '' : '',
        },
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not send the OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const valid = phone.replace(/\D/g, '').length === 10;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Dismiss — this screen is presented modally. */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: Spacing[5] }}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          hitSlop={10}
          accessibilityLabel="Close"
          style={{
            width: 38,
            height: 38,
            borderRadius: Radius.full,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceSunken,
          }}
        >
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing[6],
          paddingTop: Spacing[8],
          paddingBottom: insets.bottom + Spacing[2],
        }}
      >
        <LogoMark size={44} />

        <Text variant="display" style={{ marginTop: Spacing[6] }}>
          Know exactly what{'\n'}you&rsquo;re eating.
        </Text>
        <Text variant="body" tone="secondary" style={{ marginTop: Spacing[3] }}>
          Sign in with your phone number. We&rsquo;ll text you a one-time code — there&rsquo;s no
          password to remember.
        </Text>

        {/* Phone field */}
        <View style={{ marginTop: Spacing[8] }}>
          <Text variant="label" style={{ marginBottom: Spacing[2] }}>
            Mobile number
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: 56,
              borderRadius: Radius.lg,
              borderWidth: 1.5,
              borderColor: error ? colors.error : focused ? colors.primary : colors.border,
              backgroundColor: colors.surface,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                paddingHorizontal: Spacing[4],
                justifyContent: 'center',
                borderRightWidth: 1,
                borderRightColor: colors.border,
                backgroundColor: colors.surfaceSunken,
              }}
            >
              <Text variant="bodyMedium" tone="secondary">
                +91
              </Text>
            </View>

            <TextInput
              value={phone}
              onChangeText={(t) => {
                setPhone(t.replace(/\D/g, '').slice(0, 10));
                setError('');
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onSubmitEditing={handleSend}
              placeholder="9876543210"
              placeholderTextColor={colors.textSubtle}
              keyboardType="phone-pad"
              maxLength={10}
              autoComplete="tel"
              textContentType="telephoneNumber"
              returnKeyType="go"
              autoFocus
              style={{
                flex: 1,
                paddingHorizontal: Spacing[4],
                fontSize: Typography.lg,
                // Wide tracking makes a 10-digit number scannable as you type.
                letterSpacing: 1.2,
                color: colors.text,
              }}
            />
          </View>

          {!!error && (
            <Text variant="caption" tone="error" style={{ marginTop: Spacing[2] }}>
              {error}
            </Text>
          )}
        </View>

        <Button
          size="lg"
          fullWidth
          loading={loading}
          disabled={!valid}
          onPress={handleSend}
          style={{ marginTop: Spacing[5] }}
        >
          Send code
        </Button>

        <Text variant="caption" tone="subtle" center style={{ marginTop: Spacing[4] }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>

        {/* Why bother signing in — the three things this marketplace does
            differently, stated where the user is deciding whether to commit. */}
        <View
          style={{
            flexDirection: 'row',
            gap: Spacing[3],
            marginTop: 'auto',
            paddingTop: Spacing[10],
          }}
        >
          {PROMISES.map(({ Icon, label }) => (
            <View key={label} style={{ flex: 1, alignItems: 'center', gap: Spacing[2] }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: Radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.primaryMuted,
                }}
              >
                <Icon size={18} color={colors.primary} strokeWidth={1.9} />
              </View>
              <Text variant="caption" tone="secondary" center>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
