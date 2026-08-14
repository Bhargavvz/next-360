import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  xs: 'h-6 w-6 text-2xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

/**
 * Initials are tinted per-person by hashing the name onto a small set of brand
 * hues, so avatars in a list are distinguishable at a glance instead of a wall
 * of identical grey circles.
 */
const TINTS = [
  'bg-primary-muted text-primary',
  'bg-seal-muted text-seal',
  'bg-eco-muted text-eco',
  'bg-natural-muted text-natural',
];

function tintFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return TINTS[Math.abs(hash) % TINTS.length];
}

function Avatar({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) {
  const label = fallback || alt || '';
  const initials =
    label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || '·';

  return (
    <div
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full font-medium',
        SIZES[size],
        src ? 'bg-muted' : tintFor(label || 'x'),
        className
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
      {alt && <span className="sr-only">{alt}</span>}
    </div>
  );
}

export { Avatar };
