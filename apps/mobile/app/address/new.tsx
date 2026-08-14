import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { AddressForm, toRequestBody, type AddressFormValues } from '../../components/AddressForm';
import { Colors, Spacing, Typography } from '../../lib/theme';
import { api, apiErrorMessage } from '../../lib/api';
import { ArrowLeft } from 'lucide-react-native';

export default function AddAddressScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: AddressFormValues) => {
    setSaving(true);
    try {
      await api.post('/api/v1/users/me/addresses', toRequestBody(values));
      await queryClient.invalidateQueries({ queryKey: ['addresses'] });
      router.back();
    } catch (err) {
      Alert.alert('Could not save address', apiErrorMessage(err, 'Failed to save address'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={{ width: 36, alignItems: 'center' }}>
            <ArrowLeft size={22} color={Colors.gray800} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Address</Text>
        <View style={{ width: 36 }} />
      </View>

      <AddressForm submitLabel="Save Address" saving={saving} onSubmit={handleSave} />
    </KeyboardAvoidingView>
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
});
