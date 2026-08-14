import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import {
  AddressForm,
  toFormValues,
  toRequestBody,
  type AddressFormValues,
} from '../../components/AddressForm';
import { Colors, Spacing, Typography } from '../../lib/theme';
import { api, apiErrorMessage } from '../../lib/api';
import { ArrowLeft } from 'lucide-react-native';

/** Edit a saved delivery address. */
export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
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
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={{ width: 36, alignItems: 'center' }}>
            <ArrowLeft size={22} color={Colors.gray800} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Address</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading || !initialValues ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <AddressForm
          initialValues={initialValues}
          submitLabel="Update Address"
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gray50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing[5], paddingVertical: Spacing[4],
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
});
