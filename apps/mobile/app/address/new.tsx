import React, { useState } from 'react';
import { View, Pressable, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { useQueryClient } from '@tanstack/react-query';
import { AddressForm, toRequestBody, type AddressFormValues } from '../../components/AddressForm';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { api, apiErrorMessage } from '../../lib/api';
import { ArrowLeft } from 'lucide-react-native';

export default function AddAddressScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
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
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing[5],
          paddingVertical: Spacing[3],
        }}
      >
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
        <Text variant="displaySm" style={{ flex: 1, textAlign: 'center' }}>
          Add address
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <AddressForm submitLabel="Save address" saving={saving} onSubmit={handleSave} />
    </KeyboardAvoidingView>
  );
}
