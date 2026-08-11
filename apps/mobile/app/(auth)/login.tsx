import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const requestOtp = useAuthStore(s => s.requestOtp);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await requestOtp(phone);
      router.push({ pathname: '/(auth)/verify-otp', params: { phone } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 18,
              backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
            }}>
              <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>N</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#0a0a0a', letterSpacing: -0.5 }}>
              Next<Text style={{ color: '#16a34a' }}>360</Text>
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>Organic. Trusted. Verified.</Text>
          </View>

          {/* Card */}
          <View style={{
            backgroundColor: '#fff', borderRadius: 24, padding: 24,
            borderWidth: 1, borderColor: '#f3f4f6',
            shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 20, elevation: 4,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0a0a0a', marginBottom: 4 }}>Welcome back</Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Enter your phone number to continue</Text>

            {/* Phone input */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>Phone Number</Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14,
              overflow: 'hidden', backgroundColor: '#f9fafb',
            }}>
              <View style={{
                paddingHorizontal: 14, paddingVertical: 14,
                backgroundColor: '#f3f4f6', borderRightWidth: 1, borderRightColor: '#e5e7eb',
              }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151' }}>+91</Text>
              </View>
              <TextInput
                placeholder="9876543210"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={t => { setPhone(t.replace(/\D/g, '')); setError(''); }}
                style={{ flex: 1, fontSize: 16, color: '#0a0a0a', paddingHorizontal: 14, paddingVertical: 14 }}
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
              />
            </View>

            {error ? (
              <Text style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>⚠ {error}</Text>
            ) : null}

            {/* CTA */}
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#86efac' : '#16a34a',
                borderRadius: 14, paddingVertical: 16, marginTop: 20,
                alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
                shadowColor: '#16a34a', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Send OTP →</Text>
              )}
            </TouchableOpacity>

            {/* Dev hint */}
            <View style={{ marginTop: 20, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <Text style={{ fontSize: 12, color: '#166534', textAlign: 'center', fontWeight: '500' }}>
                🔧 Dev mode: Use any number & OTP <Text style={{ fontFamily: 'monospace', fontWeight: '700' }}>123456</Text>
              </Text>
            </View>
          </View>

          {/* Trust indicators */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 24 }}>
            {['🔒 Secure', '🌿 Organic', '✓ Verified'].map(t => (
              <Text key={t} style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>{t}</Text>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
