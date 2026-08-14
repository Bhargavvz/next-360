'use client';

import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/lib/theme';

/**
 * Toasts inherit the app's tokens rather than sonner's defaults, so they stay
 * on-palette in both themes.
 */
export function Toaster() {
  const { resolved } = useTheme();

  return (
    <SonnerToaster
      theme={resolved}
      position="bottom-center"
      offset={16}
      gap={10}
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            'group !rounded-xl !border !border-border !bg-surface !text-foreground !shadow-lg !font-sans !text-sm !gap-3',
          title: '!font-medium !text-[0.9375rem]',
          description: '!text-muted-foreground !text-[0.8125rem] !leading-snug',
          actionButton:
            '!rounded-lg !bg-primary !text-primary-foreground !text-xs !font-medium !px-3 !h-8',
          cancelButton:
            '!rounded-lg !bg-muted !text-muted-foreground !text-xs !font-medium !px-3 !h-8',
          success: '[&_[data-icon]]:!text-success',
          error: '[&_[data-icon]]:!text-destructive',
          warning: '[&_[data-icon]]:!text-warning',
          info: '[&_[data-icon]]:!text-info',
        },
      }}
    />
  );
}
