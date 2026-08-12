import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';
import { api } from '../../lib/api';
import { ArrowLeft, Check } from 'lucide-react-native';

const ADDRESS_TYPES = ['Home', 'Work', 'Other'] as const;
type AddressType = typeof ADDRESS_TYPES[number];

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [type, setType] = useState<AddressType>('Home');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (phone.replace(/\D/g, '').length !== 10) e.phone = 'Enter a valid 10-digit number';
    if (!line1.trim()) e.line1 = 'Address is required';
    if (!city.trim()) e.city = 'City is required';
    if (!state.trim()) e.state = 'State is required';
    if (pincode.length !== 6) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.post('/api/v1/addresses', {
        type,
        fullName: fullName.trim(),
        phone: `+91${phone.replace(/\D/g, '')}`,
        addressLine1: line1.trim(),
        addressLine2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault,
      });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error?.message ?? 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={{ width: 36, alignItems: 'center' }}>
            <ArrowLeft size={22} color={Colors.gray800} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Address</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[4], gap: Spacing[4], paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Address type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Type</Text>
          <View style={styles.typeRow}>
            {ADDRESS_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <Input label="Full Name" value={fullName} onChangeText={setFullName} placeholder="As on delivery" error={errors.fullName} />
          <View style={styles.phoneRow}>
            <View style={styles.countryTag}><Text style={styles.countryTagText}>+91</Text></View>
            <View style={{ flex: 1 }}>
              <Input
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
                placeholder="Mobile number"
                keyboardType="phone-pad"
                error={errors.phone}
              />
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          <Input label="Address Line 1" value={line1} onChangeText={setLine1} placeholder="House/Flat No., Street" error={errors.line1} />
          <Input label="Address Line 2 (Optional)" value={line2} onChangeText={setLine2} placeholder="Landmark, Area" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="City" value={city} onChangeText={setCity} placeholder="City" error={errors.city} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="State" value={state} onChangeText={setState} placeholder="State" error={errors.state} />
            </View>
          </View>
          <Input
            label="Pincode"
            value={pincode}
            onChangeText={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit pincode"
            keyboardType="number-pad"
            error={errors.pincode}
          />
        </View>

        {/* Default toggle */}
        <TouchableOpacity style={styles.defaultRow} onPress={() => setIsDefault(!isDefault)}>
          <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
            {isDefault && <Check size={14} color={Colors.white} strokeWidth={3} />}
          </View>
          <View>
            <Text style={styles.defaultLabel}>Set as default address</Text>
            <Text style={styles.defaultSub}>This address will be pre-selected at checkout</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[3] }]}>
        <Button fullWidth size="lg" loading={saving} onPress={handleSave}>
          Save Address
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
  section: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[4], gap: Spacing[3],
  },
  sectionTitle: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.gray400, textTransform: 'uppercase', letterSpacing: 0.8 },
  typeRow: { flexDirection: 'row', gap: Spacing[2] },
  typeChip: {
    paddingHorizontal: Spacing[4], paddingVertical: Spacing[2],
    borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border,
  },
  typeChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  typeChipText: { fontSize: Typography.sm, color: Colors.gray600, fontWeight: Typography.medium },
  typeChipTextActive: { color: Colors.primary, fontWeight: Typography.semibold },
  phoneRow: { flexDirection: 'row', gap: Spacing[2], alignItems: 'center' },
  countryTag: {
    height: 52, paddingHorizontal: Spacing[3],
    backgroundColor: Colors.gray100, borderRadius: Radius.lg,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  countryTagText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray700 },
  row: { flexDirection: 'row', gap: Spacing[3] },
  defaultRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingHorizontal: Spacing[2] },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.gray300,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  defaultLabel: { fontSize: Typography.base, fontWeight: Typography.medium, color: Colors.gray900 },
  defaultSub: { fontSize: Typography.xs, color: Colors.gray400 },
  bottomBar: {
    paddingHorizontal: Spacing[5], paddingTop: Spacing[4],
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
