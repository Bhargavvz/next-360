import { cn } from '@/lib/utils';

/** Indian grouping (1,20,000) — `en-IN` handles the lakh/crore grouping. */
export function formatInr(value: number, opts: { decimals?: boolean } = {}) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: opts.decimals ? 2 : 0,
    maximumFractionDigits: opts.decimals ? 2 : 0,
  });
}

/**
 * Price display with optional struck MRP and a savings figure.
 *
 * The rupee glyph is set slightly smaller and lighter than the number. At equal
 * weight the symbol competes with the digits; stepping it back lets the amount
 * land first, which is what the eye is actually looking for.
 */
export function Price({
  value,
  mrp,
  size = 'md',
  showSavings = false,
  className,
}: {
  value: number;
  mrp?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavings?: boolean;
  className?: string;
}) {
  const hasDiscount = !!mrp && mrp > value;
  const off = hasDiscount ? Math.round(((mrp! - value) / mrp!) * 100) : 0;

  const scale = {
    sm: { amount: 'text-sm font-semibold', symbol: 'text-2xs', mrp: 'text-xs', gap: 'gap-1.5' },
    md: { amount: 'text-lg font-semibold', symbol: 'text-xs', mrp: 'text-sm', gap: 'gap-2' },
    lg: { amount: 'text-2xl font-semibold', symbol: 'text-sm', mrp: 'text-base', gap: 'gap-2.5' },
    xl: { amount: 'text-3xl font-semibold', symbol: 'text-lg', mrp: 'text-lg', gap: 'gap-3' },
  }[size];

  return (
    <div className={cn('flex flex-wrap items-baseline', scale.gap, className)}>
      <span className={cn('tabular text-foreground', scale.amount)}>
        <span className={cn('mr-0.5 font-normal text-muted-foreground', scale.symbol)}>₹</span>
        {formatInr(value)}
      </span>

      {hasDiscount && (
        <>
          <span className={cn('tabular text-subtle-foreground line-through', scale.mrp)}>
            ₹{formatInr(mrp!)}
          </span>
          <span className={cn('font-medium text-success', scale.mrp)}>{off}% off</span>
        </>
      )}

      {showSavings && hasDiscount && (
        <span className="text-xs text-muted-foreground">
          You save ₹{formatInr(mrp! - value)}
        </span>
      )}
    </div>
  );
}
