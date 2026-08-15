import React, { useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useScreenInsets } from '../../lib/useScreenInsets';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Pencil, Trash2, Plus, Star } from 'lucide-react-native';
import { useAddresses } from '../../lib/hooks/useOrders';
import { api, apiErrorMessage } from '../../lib/api';
import { Radius, Spacing } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from '../../components/ui/Text';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';

/**
 * Saved delivery addresses — list, set default, edit, delete.
 *
 * The profile used to link straight to the "new address" form, so once an
 * address was saved there was no way to see or change it.
 */
export default function AddressListScreen() {
  const insets = useScreenInsets();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: addresses = [], isLoading, refetch } = useAddresses();

  // Returning from the add/edit form should show the change immediately.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const setDefault = async (id: string) => {
    try {
      await api.patch(`/api/v1/users/me/addresses/${id}/default`);
      await invalidate();
    } catch (err) {
      Alert.alert('Could not update', apiErrorMessage(err, 'Failed to set the default address'));
    }
  };

  const confirmDelete = (id: string, name: string) =>
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
            // An address attached to a live order cannot be removed.
            Alert.alert('Could not delete', apiErrorMessage(err, 'Failed to delete this address'));
          }
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
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
          Addresses
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={26} color={colors.primary} />}
          title="No saved addresses"
          subtitle="Add one now and checkout becomes a two-tap affair."
          action={{ label: 'Add an address', onPress: () => router.push('/address/new') }}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Spacing[5], gap: Spacing[3], paddingBottom: 130 }}
        >
          {addresses.map((addr: any) => (
            <Card
              key={addr.id}
              variant={addr.isDefault ? 'accent' : 'flat'}
              padding="md"
              style={{ gap: Spacing[1] }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
                  <Text variant="eyebrow" tone="subtle">
                    {addr.type ?? 'HOME'}
                  </Text>
                  {addr.isDefault && (
                    <Text variant="eyebrow" tone="primary">
                      Default
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: Spacing[2] }}>
                  <Pressable
                    onPress={() => router.push(`/address/${addr.id}`)}
                    hitSlop={8}
                    accessibilityLabel={`Edit address for ${addr.name}`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: Radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.surfaceSunken,
                    }}
                  >
                    <Pencil size={14} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(addr.id, addr.name)}
                    hitSlop={8}
                    accessibilityLabel={`Delete address for ${addr.name}`}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: Radius.full,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.errorMuted,
                    }}
                  >
                    <Trash2 size={14} color={colors.error} />
                  </Pressable>
                </View>
              </View>

              <Text variant="bodyMedium">{addr.name}</Text>
              <Text variant="caption" tone="secondary">
                {[addr.addressLine1, addr.addressLine2, addr.landmark, addr.city, addr.state, addr.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
              <Text variant="caption" tone="subtle">
                {addr.phone}
              </Text>

              {!addr.isDefault && (
                <Pressable
                  onPress={() => setDefault(addr.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: Spacing[2],
                    alignSelf: 'flex-start',
                  }}
                >
                  <Star size={13} color={colors.primary} />
                  <Text variant="label" tone="primary">
                    Set as default
                  </Text>
                </Pressable>
              )}
            </Card>
          ))}
        </ScrollView>
      )}

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: Spacing[5],
          paddingTop: Spacing[4],
          paddingBottom: insets.bottom + Spacing[2],
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Button
          size="lg"
          fullWidth
          onPress={() => router.push('/address/new')}
          leftIcon={<Plus size={17} color={colors.primaryOn} />}
        >
          Add a new address
        </Button>
      </View>
    </View>
  );
}
