'use client';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/auth';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestOtp = useAuthStore((s) => s.requestOtp);

  const handleSend = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestOtp(digits);
      router.push({ pathname: '/(auth)/verify-otp', params: { phone: digits } });
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Header */}
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>🌿</Text>
        </View>
        <Text style={styles.logoText}>Next360</Text>
        <Text style={styles.tagline}>India's Trusted Organic Marketplace</Text>
      </View>

      {/* Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your mobile number to receive a one-time password
            </Text>

            {/* Phone input */}
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  value={phone}
                  onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                  placeholder="Mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                  onSubmitEditing={handleSend}
                  error={error}
                />
              </View>
            </View>

            <Button onPress={handleSend} loading={loading} fullWidth size="lg">
              Send OTP
            </Button>

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Features row */}
          <View style={styles.features}>
            {[
              { icon: '✓', text: 'NPOP Certified\nOrganic Products' },
              { icon: '✓', text: 'Direct from\nFarmers' },
              { icon: '✓', text: 'Fast & Secure\nDelivery' },
            ].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureCheck}>{f.icon}</Text>
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: Spacing[8],
    gap: Spacing[2],
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  logoIcon: {
    fontSize: 36,
  },
  logoText: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.extrabold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Typography.medium,
  },
  formWrapper: {
    flex: 1,
    backgroundColor: Colors.gray50,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  formScroll: {
    padding: Spacing[5],
    gap: Spacing[5],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing[6],
    gap: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  cardSubtitle: {
    fontSize: Typography.sm,
    color: Colors.gray400,
    lineHeight: 20,
    marginTop: -Spacing[2],
  },
  phoneRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'flex-start',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    height: 52,
    backgroundColor: Colors.gray50,
  },
  flag: {
    fontSize: 18,
  },
  countryCodeText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.gray700,
  },
  terms: {
    fontSize: Typography.xs,
    color: Colors.gray400,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheck: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: Typography.bold,
  },
  featureText: {
    fontSize: Typography.xs,
    color: Colors.gray500,
    textAlign: 'center',
    lineHeight: 16,
  },
});
