import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Buttons press *down* (translate-y) rather than scaling. Scaling a button
 * blurs its text mid-animation; a 1px drop reads as physical and stays crisp.
 */
const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium transition-all duration-200 ease-natural',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-45',
    'active:translate-y-px select-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md',
        seal: 'bg-seal text-seal-foreground shadow-sm hover:brightness-110 hover:shadow-md',
        secondary:
          'bg-surface text-foreground border border-border shadow-xs hover:bg-surface-hover hover:border-border-strong',
        outline:
          'border border-border-strong bg-transparent text-foreground hover:bg-surface-hover',
        ghost: 'text-foreground hover:bg-surface-hover',
        subtle: 'bg-muted text-foreground hover:bg-surface-hover',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:brightness-110',
        link: 'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-8 rounded-md px-2.5 text-xs',
        sm: 'h-9 rounded-md px-3.5 text-sm',
        md: 'h-11 rounded-lg px-5 text-base',
        lg: 'h-13 rounded-lg px-7 text-base',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Render as the child element (e.g. a Next <Link>) while keeping the styles. */
  asChild?: boolean;
}

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-25" />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, loading, children, disabled, asChild, ...props }, ref) => {
    // Slot forwards props onto the caller's element, so it must receive the
    // children untouched — no loading wrapper on this path.
    if (asChild) {
      return (
        <Slot className={cn(buttonVariants({ variant, size, block }), className)} {...props}>
          {children}
        </Slot>
      );
    }

    // While loading, the label stays in place (invisible) so the button keeps
    // its width — no layout jump when a spinner appears.
    return (
      <button
        className={cn(buttonVariants({ variant, size, block }), className)}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 grid place-items-center">
            <Spinner />
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center gap-2 transition-opacity',
            loading && 'opacity-0'
          )}
        >
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
