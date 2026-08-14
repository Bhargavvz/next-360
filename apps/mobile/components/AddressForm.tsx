import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Colors, Spacing, Typography, Radius } from '../lib/theme';
import { Check } from 'lucide-react-native';

const ADDRESS_TYPES = ['HOME', 'WORK', 'OTHER'] as const;
export type AddressType = typeof ADDRESS_TYPES[number];

export interface AddressFormValues {
  type: AddressType;
  name: string;
  /** 10 digits, no country code — the +91 prefix is added on submit. */
  phone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  deliveryInstructions: string;
}

export const emptyAddress: AddressFormValues = {
  type: 'HOME',
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
  deliveryInstructions: '',
};

/** Map an API address onto form values, stripping the +91 prefix from the phone. */
export function toFormValues(address: any): AddressFormValues {
  return {
    type: (address.type ?? 'HOME') as AddressType,
    name: address.name ?? '',
    phone: String(address.phone ?? '').replace(/^\+91/, ''),
    addressLine1: address.addressLine1 ?? '',
    addressLine2: address.addressLine2 ?? '',
    landmark: address.landmark ?? '',
    city: address.city ?? '',
    state: address.state ?? '',
    pincode: address.pincode ?? '',
    isDefault: Boolean(address.isDefault),
    deliveryInstructions: address.deliveryInstructions ?? '',
  };
}

/** Build the API request body. Optional fields are omitted rather than sent blank. */
export function toRequestBody(values: AddressFormValues) {
  return {
    type: values.type,
    name: values.name.trim(),
    phone: `+91${values.phone.replace(/\D/g, '')}`,
    addressLine1: values.addressLine1.trim(),
    addressLine2: values.addressLine2.trim() || undefined,
    landmark: values.landmark.trim() || undefined,
    city: values.city.trim(),
    state: values.state.trim(),
    pincode: values.pincode.trim(),
    isDefault: values.isDefault,
    deliveryInstructions: values.deliveryInstructions.trim() || undefined,
  };
}

/**
 * Client-side checks mirroring the server's validation rules, so obvious mistakes
 * are caught before a round trip.
 */
export function validateAddress(values: AddressFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const digits = values.phone.replace(/\D/g, '');

  if (!values.name.trim()) errors.name = 'Recipient name is required';
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) {
    errors.phone = 'Enter a valid Indian mobile number (starts with 6-9)';
  }
  if (!values.addressLine1.trim()) errors.addressLine1 = 'Address is required';
  if (!values.city.trim()) errors.city = 'City is required';
  if (!values.state.trim()) errors.state = 'State is required';
  if (!/^[1-9][0-9]{5}$/.test(values.pincode)) errors.pincode = 'Enter a valid 6-digit pincode';

  return errors;
}

interface Props {
  initialValues?: AddressFormValues;
  submitLabel: string;
  saving: boolean;
  /** Hidden when editing the address that is already the default. */
  allowDefaultToggle?: boolean;
  onSubmit: (values: AddressFormValues) => void;
}

/** Shared add/edit address form. */
export function AddressForm({
  initialValues = emptyAddress,
  submitLabel,
  saving,
  allowDefaultToggle = true,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<AddressFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Editing loads asynchronously — adopt the values once they arrive.
  useEffect(() => setValues(initialValues), [initialValues]);

  const set = <K extends keyof AddressFormValues>(key: K, value: AddressFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key]: '' } : e));
  };

  const handleSubmit = () => {
    const found = validateAddress(values);
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing[4], gap: Spacing[4], paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Type</Text>
          <View style={styles.typeRow}>
            {ADDRESS_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, values.type === t && styles.typeChipActive]}
                onPress={() => set('type', t)}
              >
                <Text style={[styles.typeChipText, values.type === t && styles.typeChipTextActive]}>
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <Input
            label="Full Name"
            value={values.name}
            onChangeText={(v) => set('name', v)}
            placeholder="As on delivery"
            error={errors.name}
          />
          <View style={styles.phoneRow}>
            <View style={styles.countryTag}>
              <Text style={styles.countryTagText}>+91</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Input
                value={values.phone}
                onChangeText={(v) => set('phone', v.replace(/\D/g, '').slice(0, 10))}
                placeholder="Mobile number"
                keyboardType="phone-pad"
                error={errors.phone}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          <Input
            label="Address Line 1"
            value={values.addressLine1}
            onChangeText={(v) => set('addressLine1', v)}
            placeholder="House/Flat No., Street"
            error={errors.addressLine1}
          />
          <Input
            label="Address Line 2 (Optional)"
            value={values.addressLine2}
            onChangeText={(v) => set('addressLine2', v)}
            placeholder="Apartment, Area"
          />
          <Input
            label="Landmark (Optional)"
            value={values.landmark}
            onChangeText={(v) => set('landmark', v)}
            placeholder="Nearby landmark"
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="City"
                value={values.city}
                onChangeText={(v) => set('city', v)}
                placeholder="City"
                error={errors.city}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="State"
                value={values.state}
                onChangeText={(v) => set('state', v)}
                placeholder="State"
                error={errors.state}
              />
            </View>
          </View>
          <Input
            label="Pincode"
            value={values.pincode}
            onChangeText={(v) => set('pincode', v.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit pincode"
            keyboardType="number-pad"
            error={errors.pincode}
          />
          <Input
            label="Delivery Instructions (Optional)"
            value={values.deliveryInstructions}
            onChangeText={(v) => set('deliveryInstructions', v)}
            placeholder="e.g. Leave with the security guard"
          />
        </View>

        {allowDefaultToggle && (
          <TouchableOpacity style={styles.defaultRow} onPress={() => set('isDefault', !values.isDefault)}>
            <View style={[styles.checkbox, values.isDefault && styles.checkboxActive]}>
              {values.isDefault && <Check size={14} color={Colors.white} strokeWidth={3} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.defaultLabel}>Set as default address</Text>
              <Text style={styles.defaultSub}>This address will be pre-selected at checkout</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button fullWidth size="lg" loading={saving} onPress={handleSubmit}>
          {submitLabel}
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing[4], gap: Spacing[3],
  },
  sectionTitle: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.gray400,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
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
    paddingHorizontal: Spacing[5], paddingTop: Spacing[4], paddingBottom: Spacing[6],
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
