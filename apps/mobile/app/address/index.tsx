import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useAddresses } from '../../lib/hooks/useOrders';
import { EmptyState } from '../../components/ui/EmptyState';
import { Colors, Spacing, Typography, Radius } from '../../lib/theme';
import { api, apiErrorMessage } from '../../lib/api';
import { ArrowLeft, MapPin, Pencil, Trash2, Plus, Star } from 'lucide-react-native';

/**
 * Saved delivery addresses — list, set default, edit and delete.
 *
 * Previously the profile linked straight to the "new address" form, so there was no way
 * to see or change an address once saved.
 */
export default function AddressListScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: addresses = [], isLoading, refetch } = useAddresses();

  // Coming back from the add/edit form should show the change immediately.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/api/v1/users/me/addresses/${id}/default`);
      await invalidate();
    } catch (err) {
      Alert.alert('Could not update', apiErrorMessage(err, 'Failed to set the default address'));
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete address', `Remove the address for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/v1/users/me/addresses/${id}`);
            await invalidate();
          } catch (err) {
            // An address attached to an in-flight order cannot be removed.
            Alert.alert('Could not delete', apiErrorMessage(err, 'Failed to delete this address'));
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={{ width: 36, alignItems: 'center' }}>
            <ArrowLeft size={22} color={Colors.gray800} />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Addresses</Text>
        <View style={{ width: 36 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={48} color={Colors.gray400} />}
          title="No saved addresses"
          subtitle="Add an address to speed up checkout"
          action={{ label: 'Add Address', onPress: () => router.push('/address/new') }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing[4], gap: Spacing[3], paddingBottom: 120 }}
        >
          {addresses.map((addr: any) => (
            <View key={addr.id} style={[styles.card, addr.isDefault && styles.cardDefault]}>
              <View style={styles.cardTop}>
                <View style={styles.tagRow}>
                  <Text style={styles.typeTag}>{addr.type ?? 'HOME'}</Text>
                  {addr.isDefault && <Text style={styles.defaultTag}>DEFAULT</Text>}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => router.push(`/address/${addr.id}`)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Pencil size={16} color={Colors.gray700} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => handleDelete(addr.id, addr.name)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.name}>{addr.name}</Text>
              <Text style={styles.text}>
                {[addr.addressLine1, addr.addressLine2, addr.landmark, addr.city, addr.state, addr.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              <Text style={styles.phone}>{addr.phone}</Text>

              {!addr.isDefault && (
                <TouchableOpacity style={styles.defaultBtn} onPress={() => handleSetDefault(addr.id)}>
                  <Star size={14} color={Colors.primary} />
                  <Text style={styles.defaultBtnText}>Set as default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing[3] }]}>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/address/new')}>
          <Plus size={18} color={Colors.white} />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: Spacing[4], gap: 4,
  },
  cardDefault: { borderColor: Colors.primaryBorder, backgroundColor: Colors.primaryMuted },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagRow: { flexDirection: 'row', gap: Spacing[2], alignItems: 'center' },
  typeTag: {
    fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.gray600,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  defaultTag: { fontSize: Typography.xs, fontWeight: Typography.bold, color: Colors.primary },
  actions: { flexDirection: 'row', gap: Spacing[2] },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.gray100,
  },
  name: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.gray900 },
  text: { fontSize: Typography.sm, color: Colors.gray500, lineHeight: 20 },
  phone: { fontSize: Typography.sm, color: Colors.gray400 },
  defaultBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing[2] },
  defaultBtnText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
  bottomBar: {
    paddingHorizontal: Spacing[5], paddingTop: Spacing[4],
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2],
    backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: Spacing[4],
  },
  addBtnText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.white },
});
