import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The editorial section header used across the site.
 *
 * The eyebrow (small caps label) is what makes a page feel like a magazine
 * rather than a dashboard — it gives every section a category before its name.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel = 'View all',
  align = 'start',
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  hrefLabel?: string;
  align?: 'start' | 'center';
  className?: string;
}) {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex gap-4',
        centered
          ? 'flex-col items-center text-center'
          : 'flex-col sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className={cn('space-y-2', centered && 'max-w-measure-tight')}>
        {eyebrow && (
          <p className="text-2xs font-medium uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-semibold text-balance text-foreground md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-measure text-pretty text-base text-muted-foreground">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-natural group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/** Consistent vertical rhythm between page sections. */
export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('py-14 md:py-20', className)} {...props}>
      {children}
    </section>
  );
}
