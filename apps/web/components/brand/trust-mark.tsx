import * as React from 'react';
import { ShieldCheck, Sprout, Recycle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ProductType = 'ORGANIC' | 'NATURAL' | 'ECO_FRIENDLY';

/**
 * The classification system, in one place.
 *
 * The whole product rests on this distinction being legible at a glance, so it
 * is encoded once — icon, wording and colour together — and never re-spelled
 * inline. `verified` is the pivotal difference: only ORGANIC can be verified,
 * and only a verified item may wear gold.
 */
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

const TONE_CLASSES = {
  organic: 'bg-organic-muted text-organic',
  natural: 'bg-natural-muted text-natural',
  eco: 'bg-eco-muted text-eco',
} as const;

/**
 * The gold seal. Reserved for admin-verified organic certification and used
 * nowhere else — its scarcity is the entire point. A "natural" product that
 * merely claims to be organic never gets one.
 */
export function VerifiedSeal({
  size = 'md',
  showLabel = true,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}) {
  const dims = {
    sm: { box: 'h-5 gap-1 px-1.5 text-2xs', icon: 'h-3 w-3' },
    md: { box: 'h-7 gap-1.5 px-2.5 text-xs', icon: 'h-3.5 w-3.5' },
    lg: { box: 'h-9 gap-2 px-3.5 text-sm', icon: 'h-4 w-4' },
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-seal-border bg-seal-muted font-medium text-seal',
        dims.box,
        className
      )}
      title="NPOP certificate reviewed and verified by the Next360 team"
    >
      <ShieldCheck className={cn(dims.icon, 'shrink-0')} strokeWidth={2.25} />
      {showLabel && (
        <span className={cn(size === 'sm' && 'uppercase tracking-wider')}>NPOP Verified</span>
      )}
    </span>
  );
}

/** The classification chip shown on cards and detail pages. */
export function TypeMark({
  type,
  size = 'md',
  showLabel = true,
  className,
}: {
  type?: string | null;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}) {
  const config = type ? PRODUCT_TYPES[type as ProductType] : undefined;
  if (!config) return null;

  const { Icon, label, tone } = config;
  const dims =
    size === 'sm'
      ? { box: 'h-5 gap-1 px-1.5 text-2xs uppercase tracking-wider', icon: 'h-3 w-3' }
      : { box: 'h-7 gap-1.5 px-2.5 text-xs', icon: 'h-3.5 w-3.5' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        TONE_CLASSES[tone],
        dims.box,
        className
      )}
    >
      <Icon className={cn(dims.icon, 'shrink-0')} strokeWidth={2.25} />
      {showLabel && label}
    </span>
  );
}

/**
 * Certificate identifiers, rendered in mono.
 *
 * Setting these in the UI sans would make them look like prose; monospace
 * signals "this is a record you can check", which is the promise of the brand.
 */
export function CertificateId({ id, className }: { id: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-muted px-2 py-1 font-mono text-xs tracking-tight text-muted-foreground',
        className
      )}
    >
      {id}
    </span>
  );
}
