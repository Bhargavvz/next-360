import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-xl transition-all duration-250 ease-natural', {
  variants: {
    variant: {
      /** Default surface — a hairline, no shadow. Most cards should be this. */
      flat: 'bg-surface border border-border',
      /** Lifted, for things that float above the page (summaries, modals). */
      raised: 'bg-surface border border-border shadow-md',
      /** Inset well — used for grouped rows and read-only detail blocks. */
      sunken: 'bg-surface-sunken border border-border/60',
      /** Brand-tinted, for callouts and verification panels. */
      accent: 'bg-primary-muted border border-primary-border',
      seal: 'bg-seal-muted border border-seal-border',
      ghost: 'bg-transparent',
    },
    /** Adds hover lift. Only for cards that are entirely clickable. */
    interactive: {
      true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:border-border-strong',
      false: '',
    },
    padding: {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6 md:p-7',
    },
  },
  defaultVariants: { variant: 'flat', interactive: false, padding: 'md' },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, interactive, padding }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-base font-semibold text-foreground', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-3', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
