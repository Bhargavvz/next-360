import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { useQueryClient } from '@tanstack/react-query';
import {
  AddressForm,
  toFormValues,
  toRequestBody,
  type AddressFormValues,
} from '../../components/AddressForm';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { api, apiErrorMessage } from '../../lib/api';
import { ArrowLeft } from 'lucide-react-native';

/** Edit a saved delivery address. */
export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const [address, setAddress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/api/v1/users/me/addresses/${id}`)
      .then((res) => {
        if (!cancelled) setAddress(res.data.data);
      })
      .catch((err) => {
        if (cancelled) return;
        Alert.alert('Could not load address', apiErrorMessage(err, 'This address is unavailable'), [
          { text: 'OK', onPress: () => router.back() },
        ]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const initialValues = useMemo(
    () => (address ? toFormValues(address) : undefined),
    [address]
  );

  const handleSave = async (values: AddressFormValues) => {
    setSaving(true);
    try {
      await api.put(`/api/v1/users/me/addresses/${id}`, toRequestBody(values));
      await queryClient.invalidateQueries({ queryKey: ['addresses'] });
      router.back();
    } catch (err) {
      Alert.alert('Could not save address', apiErrorMessage(err, 'Failed to update address'));
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
          Edit address
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {loading || !initialValues ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <AddressForm
          initialValues={initialValues}
          submitLabel="Update address"
          saving={saving}
          // An address that is already the default cannot be un-defaulted here;
          // pick a different default from the list instead.
          allowDefaultToggle={!address?.isDefault}
          onSubmit={handleSave}
        />
      )}
    </KeyboardAvoidingView>
  );
}
