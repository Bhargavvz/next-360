import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Star rating.
 *
 * Partial stars are done with a clipped overlay rather than rounding to the
 * nearest half — a 4.3 that renders as 4.5 quietly overstates the product.
 */
export function Rating({
  value,
  count,
  size = 'md',
  showValue = true,
  className,
}: {
  value?: number | null;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}) {
  const dims = {
    sm: { star: 'h-3 w-3', text: 'text-xs', gap: 'gap-1' },
    md: { star: 'h-3.5 w-3.5', text: 'text-sm', gap: 'gap-1.5' },
    lg: { star: 'h-4 w-4', text: 'text-base', gap: 'gap-2' },
  }[size];

  if (value == null || value <= 0) {
    return (
      <span className={cn('text-subtle-foreground', dims.text, className)}>No reviews yet</span>
    );
  }

  const pct = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <span className={cn('inline-flex items-center', dims.gap, className)}>
      <span className="relative inline-flex" aria-hidden>
        <span className="inline-flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(dims.star, 'text-border-strong')} fill="currentColor" />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex gap-0.5 overflow-hidden"
          style={{ width: `${pct}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(dims.star, 'shrink-0 text-seal')} fill="currentColor" />
          ))}
        </span>
      </span>

      {showValue && (
        <span className={cn('tabular font-medium text-foreground', dims.text)}>
          {value.toFixed(1)}
        </span>
      )}
      {count != null && count > 0 && (
        <span className={cn('text-subtle-foreground', dims.text)}>({count})</span>
      )}

      <span className="sr-only">
        Rated {value.toFixed(1)} out of 5{count ? ` from ${count} reviews` : ''}
      </span>
    </span>
  );
}
