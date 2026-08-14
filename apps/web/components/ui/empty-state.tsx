import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Empty states.
 *
 * The icon sits in a soft tinted disc rather than floating on the page — an
 * unframed outline icon at large size looks like a rendering error. The copy is
 * always a full sentence explaining what to do next, never just "No data".
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-primary-muted text-primary [&_svg]:h-6 [&_svg]:w-6">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-measure-tight text-pretty text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
