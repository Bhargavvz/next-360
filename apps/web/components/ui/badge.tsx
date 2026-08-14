import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral: 'bg-muted text-muted-foreground',
        outline: 'border border-border text-muted-foreground',
        primary: 'bg-primary-muted text-primary',
        /** Certification proof. Deliberately the only gold thing on screen. */
        seal: 'bg-seal-muted text-seal border border-seal-border',
        organic: 'bg-organic-muted text-organic',
        natural: 'bg-natural-muted text-natural',
        eco: 'bg-eco-muted text-eco',
        success: 'bg-success-muted text-success',
        warning: 'bg-warning-muted text-warning',
        destructive: 'bg-destructive-muted text-destructive',
        info: 'bg-info-muted text-info',
        /** High-contrast, for discounts and other things that must shout. */
        solid: 'bg-foreground text-background',
      },
      size: {
        sm: 'h-5 rounded px-1.5 text-2xs uppercase tracking-wider',
        md: 'h-6 rounded-md px-2 text-xs',
        lg: 'h-7 rounded-md px-2.5 text-xs',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'md' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
