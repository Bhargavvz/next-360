'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme, type ThemeChoice } from '@/lib/theme';
import { cn } from '@/lib/utils';

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

/**
 * Segmented light/dark/system control.
 *
 * The active pill is a single absolutely-positioned element that slides between
 * slots, so switching reads as one continuous movement instead of three
 * independent fades.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server has no idea which theme is active; rendering the real state
  // before mount would cause a hydration mismatch.
  useEffect(() => setMounted(true), []);

  const activeIndex = Math.max(0, OPTIONS.findIndex((o) => o.value === theme));

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        'relative inline-flex items-center rounded-full border border-border bg-surface-sunken p-0.5',
        className
      )}
    >
      {mounted && (
        <span
          aria-hidden
          className="absolute h-7 w-7 rounded-full bg-surface shadow-xs transition-transform duration-250 ease-natural"
          style={{ transform: `translateX(${activeIndex * 28}px)` }}
        />
      )}

      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={mounted ? theme === value : undefined}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={cn(
            'relative z-10 grid h-7 w-7 place-items-center rounded-full transition-colors',
            mounted && theme === value
              ? 'text-foreground'
              : 'text-subtle-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

/** Compact single-button variant for tight spaces (mobile menu, footer). */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolved, cycle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={cycle}
      aria-label="Change colour theme"
      className={cn(
        'grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground',
        className
      )}
    >
      {mounted && resolved === 'dark' ? (
        <Moon className="h-[18px] w-[18px]" />
      ) : (
        <Sun className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
