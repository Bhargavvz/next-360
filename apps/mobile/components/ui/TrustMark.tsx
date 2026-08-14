import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ShieldCheck, Sprout, Recycle } from 'lucide-react-native';
import { Radius, Spacing, Typography } from '../../lib/theme';
import { useTheme } from '../../lib/useTheme';
import { Text } from './Text';

export type ProductType = 'ORGANIC' | 'NATURAL' | 'ECO_FRIENDLY';

/** Classification metadata — kept identical to the web definition. */
export const PRODUCT_TYPES: Record<
  ProductType,
  { label: string; claim: string; Icon: typeof ShieldCheck; tone: 'organic' | 'natural' | 'eco' }
> = {
  ORGANIC: {
    label: 'Organic',
    claim: 'NPOP certificate verified by Next360',
    Icon: ShieldCheck,
    tone: 'organic',
  },
  NATURAL: {
    label: 'Natural',
    claim: 'Seller-declared · no synthetic inputs',
    Icon: Sprout,
    tone: 'natural',
  },
  ECO_FRIENDLY: {
    label: 'Eco-friendly',
    claim: 'Seller-declared · sustainable practices',
    Icon: Recycle,
    tone: 'eco',
  },
};

/**
 * The gold seal — admin-verified NPOP certification only.
 *
 * Nothing else in the app is allowed to use the seal colour. That scarcity is
 * what makes it mean something when a shopper sees it on a card.
 */
export function VerifiedSeal({
  size = 'md',
  showLabel = true,
  style,
}: {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const dims = {
    sm: { h: 20, px: Spacing[1.5], icon: 11, font: Typography['2xs'] },
    md: { h: 26, px: Spacing[2.5], icon: 13, font: Typography.xs },
    lg: { h: 34, px: Spacing[3], icon: 16, font: Typography.sm },
  }[size];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          height: dims.h,
          paddingHorizontal: dims.px,
          borderRadius: Radius.full,
          backgroundColor: colors.sealMuted,
          borderWidth: 1,
          borderColor: colors.sealBorder,
        },
        style,
      ]}
      accessibilityLabel="NPOP verified organic"
    >
      <ShieldCheck size={dims.icon} color={colors.seal} strokeWidth={2.5} />
      {showLabel && (
        <Text variant="eyebrow" tone="seal" style={{ fontSize: dims.font }}>
          NPOP Verified
        </Text>
      )}
    </View>
  );
}

/** Classification chip for non-verified products. */
export function TypeMark({
  type,
  size = 'md',
  showLabel = true,
  style,
}: {
  type?: string | null;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const config = type ? PRODUCT_TYPES[type as ProductType] : undefined;
  if (!config) return null;

  const tones = {
    organic: { fg: colors.organic, bg: colors.organicMuted },
    natural: { fg: colors.natural, bg: colors.naturalMuted },
    eco: { fg: colors.eco, bg: colors.ecoMuted },
  }[config.tone];

  const dims =
    size === 'sm'
      ? { h: 20, px: Spacing[1.5], icon: 11, font: Typography['2xs'] }
      : { h: 26, px: Spacing[2.5], icon: 13, font: Typography.xs };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          height: dims.h,
          paddingHorizontal: dims.px,
          borderRadius: Radius.full,
          backgroundColor: tones.bg,
        },
        style,
      ]}
    >
      <config.Icon size={dims.icon} color={tones.fg} strokeWidth={2.5} />
      {showLabel && (
        <Text variant="eyebrow" style={{ fontSize: dims.font, color: tones.fg }}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

/** Certificate identifier, set in mono so it reads as a record, not prose. */
export function CertificateId({ id, style }: { id: string; style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          paddingHorizontal: Spacing[2],
          paddingVertical: Spacing[1],
          borderRadius: Radius.xs,
          backgroundColor: colors.surfaceSunken,
        },
        style,
      ]}
    >
      <Text variant="mono" tone="secondary">
        {id}
      </Text>
    </View>
  );
}
