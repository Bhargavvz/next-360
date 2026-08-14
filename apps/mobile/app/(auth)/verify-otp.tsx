import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MessageSquare, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '../../lib/auth';
import { apiErrorMessage } from '../../lib/api';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';

const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{
    phone: string;
    resendIn?: string;
    expiresIn?: string;
    devOtp?: string;
  }>();
  const phone = params.phone;
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Countdowns come from the server so the UI matches what the API actually enforces.
  const [resendSeconds, setResendSeconds] = useState(Number(params.resendIn) || 30);
  const [expirySeconds, setExpirySeconds] = useState(Number(params.expiresIn) || 300);
  const [devOtp, setDevOtp] = useState(params.devOtp || '');
  const [resending, setResending] = useState(false);
  const inputs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const { login, requestOtp } = useAuthStore();

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
      setExpirySeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = useCallback(
    (value: string, index: number) => {
      const newOtp = [...otp];
      const digit = value.replace(/\D/g, '').slice(-1);
      newOtp[index] = digit;
      setOtp(newOtp);
      setError('');

      if (digit && index < OTP_LENGTH - 1) {
        inputs.current[index + 1]?.focus();
      }

      // Auto-submit
      if (digit && index === OTP_LENGTH - 1 && newOtp.every((d) => d !== '')) {
        handleVerify(newOtp.join(''));
      }
    },
    [otp]
  );

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (code?: string) => {
    const finalCode = code ?? otp.join('');
    if (finalCode.length !== OTP_LENGTH) return;
    setLoading(true);
    setError('');
    try {
      await login(phone!, finalCode);
      router.replace('/(tabs)');
    } catch (err) {
      setError(apiErrorMessage(err, 'Incorrect OTP. Please try again.'));
      shake();
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const challenge = await requestOtp(phone!);
      setResendSeconds(challenge?.resendIn ?? 30);
      setExpirySeconds(challenge?.expiresIn ?? 300);
      setDevOtp(challenge?.devMode ? challenge.devOtp ?? '' : '');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } catch (err) {
      // Covers the server-side resend cooldown and per-phone rate limit.
      setError(apiErrorMessage(err, 'Failed to resend OTP. Please try again.'));
    } finally {
      setResending(false);
    }
  };

  const displayPhone = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : '';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color={Colors.gray800} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
        {/* Header */}
        <View style={styles.iconContainer}>
          <MessageSquare size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{displayPhone}</Text>
        </Text>

        {/* OTP cells */}
        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[
                styles.cell,
                digit ? styles.cellFilled : undefined,
                !!error ? styles.cellError : undefined,
              ]}
              value={digit}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              selectionColor={Colors.primary}
              textContentType="oneTimeCode"
              autoComplete={i === 0 ? 'sms-otp' : 'off'}
            />
          ))}
        </Animated.View>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Verify button */}
        <TouchableOpacity
          style={[
            styles.verifyBtn,
            otp.every((d) => d !== '') && !loading ? styles.verifyBtnActive : styles.verifyBtnDisabled,
          ]}
          onPress={() => handleVerify()}
          disabled={loading || !otp.every((d) => d !== '')}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.verifyText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        {/* Expiry */}
        <Text style={styles.expiryText}>
          {expirySeconds > 0
            ? `Code expires in ${Math.floor(expirySeconds / 60)}:${String(expirySeconds % 60).padStart(2, '0')}`
            : 'This code has expired — request a new one'}
        </Text>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resendSeconds > 0 || resending}>
            {resendSeconds > 0 ? (
              <Text style={styles.resendTimer}>Resend in {resendSeconds}s</Text>
            ) : resending ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.resendLink}>Resend OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Shown only when the server reports SMS delivery is disabled. */}
        {devOtp ? (
          <View style={styles.devHint}>
            <Text style={styles.devHintText}>
              SMS delivery is off in this environment. Use <Text style={styles.devHintCode}>{devOtp}</Text>
            </Text>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: Typography.base,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[6],
    gap: Spacing[4],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[4],
  },
  title: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
  phone: {
    color: Colors.gray900,
    fontWeight: Typography.semibold,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[2],
  },
  cell: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    textAlign: 'center',
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    backgroundColor: Colors.gray50,
  },
  cellFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  cellError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  error: {
    fontSize: Typography.sm,
    color: Colors.error,
    fontWeight: Typography.medium,
    textAlign: 'center',
  },
  verifyBtn: {
    width: '100%',
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
  },
  verifyBtnActive: {
    backgroundColor: Colors.primary,
  },
  verifyBtnDisabled: {
    backgroundColor: Colors.gray200,
  },
  verifyText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.white,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: Typography.sm,
    color: Colors.gray400,
  },
  resendTimer: {
    fontSize: Typography.sm,
    color: Colors.gray400,
    fontWeight: Typography.medium,
  },
  resendLink: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semibold,
  },
  expiryText: {
    fontSize: Typography.xs,
    color: Colors.gray400,
  },
  devHint: {
    backgroundColor: Colors.gray100,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    marginTop: Spacing[2],
  },
  devHintText: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    textAlign: 'center',
  },
  devHintCode: {
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
});
