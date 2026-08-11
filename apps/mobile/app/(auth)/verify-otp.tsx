import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../lib/auth';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login, requestOtp } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<any[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (val: string, idx: number) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = v;
    setOtp(newOtp);
    setError('');
    if (v && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (!v && idx > 0) inputRefs.current[idx - 1]?.focus();
    // Auto-verify when all filled
    if (v && newOtp.every(d => d !== '') && newOtp.filter(d => d).length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleVerify = async (otpStr?: string) => {
    const code = otpStr || otp.join('');
    if (code.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    setError('');
    try {
      await login(phone, code);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await requestOtp(phone);
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 24, color: '#374151' }}>←</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{
              width: 56, height: 56, borderRadius: 16,
              backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}>
              <Text style={{ fontSize: 28 }}>📱</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#0a0a0a' }}>Verify Your Number</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 6, textAlign: 'center' }}>
              OTP sent to +91 {phone}
            </Text>
          </View>

          {/* OTP inputs */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={ref => { inputRefs.current[idx] = ref; }}
                value={digit}
                onChangeText={v => handleOtpChange(v, idx)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={{
                  width: 48, height: 56, borderRadius: 14,
                  borderWidth: 2,
                  borderColor: digit ? '#16a34a' : error ? '#ef4444' : '#e5e7eb',
                  backgroundColor: digit ? '#f0fdf4' : '#f9fafb',
                  textAlign: 'center', fontSize: 22, fontWeight: '700',
                  color: '#0a0a0a',
                }}
              />
            ))}
          </View>

          {error ? (
            <Text style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginBottom: 12 }}>⚠ {error}</Text>
          ) : null}

          {/* Verify button */}
          <TouchableOpacity
            onPress={() => handleVerify()}
            disabled={loading || otp.some(d => d === '')}
            style={{
              backgroundColor: (loading || otp.some(d => d === '')) ? '#86efac' : '#16a34a',
              borderRadius: 14, paddingVertical: 16, marginTop: 16,
              alignItems: 'center',
              shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Verify & Login</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={{ alignItems: 'center', marginTop: 24 }}>
            {countdown > 0 ? (
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>
                Resend OTP in <Text style={{ color: '#16a34a', fontWeight: '600' }}>{countdown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text style={{ fontSize: 13, color: '#16a34a', fontWeight: '600' }}>
                  {resending ? 'Sending…' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Dev hint */}
          <View style={{ marginTop: 28, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
            <Text style={{ fontSize: 12, color: '#166534', textAlign: 'center', fontWeight: '500' }}>
              🔧 Dev mode OTP: <Text style={{ fontWeight: '800', fontFamily: 'monospace' }}>1 2 3 4 5 6</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
