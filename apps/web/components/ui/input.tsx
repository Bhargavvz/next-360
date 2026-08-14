import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  /** Trailing adornment — a unit, a clear button, a toggle. */
  suffix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, icon, suffix, id, required, ...props }, ref) => {
    const generated = React.useId();
    const inputId = id ?? generated;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle-foreground [&_svg]:h-4 [&_svg]:w-4">
              {icon}
            </div>
          )}

          <input
            type={type}
            id={inputId}
            ref={ref}
            required={required}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-11 w-full rounded-lg border bg-surface px-3.5 text-base text-foreground',
              'transition-[border-color,box-shadow,background-color] duration-200 ease-natural',
              'placeholder:text-subtle-foreground',
              // A tinted glow rather than a hard ring — softer, still obvious.
              'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12',
              'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
              icon && 'pl-10',
              suffix && 'pr-11',
              error
                ? 'border-destructive focus:border-destructive focus:ring-destructive/12'
                : 'border-input hover:border-border-strong',
              className
            )}
            {...props}
          />

          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle-foreground">
              {suffix}
            </div>
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-destructive">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-subtle-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, required, ...props }, ref) => {
    const generated = React.useId();
    const inputId = id ?? generated;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          required={required}
          aria-invalid={!!error || undefined}
          className={cn(
            'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-base text-foreground',
            'min-h-[96px] resize-y transition-[border-color,box-shadow] duration-200 ease-natural',
            'placeholder:text-subtle-foreground',
            'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12',
            'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/12'
              : 'border-input hover:border-border-strong',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : hint ? (
          <p className="text-xs text-subtle-foreground">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Input, Textarea };
