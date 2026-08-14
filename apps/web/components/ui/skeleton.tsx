import { cn } from '@/lib/utils';

/**
 * Loading placeholder. Uses a travelling shimmer rather than an opacity pulse —
 * a pulse reads as "broken/disabled", a shimmer reads as "arriving".
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('shimmer rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/** Skeleton shaped like a ProductCard, so grids don't reflow when data lands. */
function ProductCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export { Skeleton, ProductCardSkeleton };
