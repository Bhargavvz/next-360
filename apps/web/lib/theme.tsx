'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

const STORAGE_KEY = 'next360_theme';

interface ThemeContextValue {
  /** What the user picked, including "system". */
  theme: ThemeChoice;
  /** What is actually on screen right now. */
  resolved: Resolved;
  setTheme: (theme: ThemeChoice) => void;
  /** Cycles light → dark → system. */
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme is CSS-first.
 *
 * The stylesheet resolves the *system* preference on its own via
 * `@media (prefers-color-scheme: dark)`, so the common case is correct before
 * the first paint with no render-blocking script and no flash.
 *
 * This provider only handles explicit overrides, by putting `.light` or `.dark`
 * on <html>. Those classes both win over the media query and are what it opts
 * out of (`:root:not(.light)`).
 */
function applyClass(choice: ThemeChoice) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  if (choice !== 'system') root.classList.add(choice);

  // Let the UA style form controls and scrollbars to match.
  root.style.colorScheme = choice === 'system' ? '' : choice;
}

function currentResolved(): Resolved {
  if (typeof window === 'undefined') return 'light';
  const root = document.documentElement;
  if (root.classList.contains('dark')) return 'dark';
  if (root.classList.contains('light')) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>('system');
  const [resolved, setResolved] = useState<Resolved>('light');

  // Restore a stored override. A user on "system" needs nothing here — CSS has
  // already done the work.
  useEffect(() => {
    let stored: ThemeChoice = 'system';
    try {
      stored = (localStorage.getItem(STORAGE_KEY) as ThemeChoice | null) ?? 'system';
    } catch {
      // Private mode.
    }
    setThemeState(stored);
    if (stored !== 'system') applyClass(stored);
    setResolved(currentResolved());
  }, []);

  // Track the OS while on "system" so `resolved` (used by the toast theme and
  // the toggle icon) stays accurate.
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setResolved(currentResolved());
    sync();

    if (theme !== 'system') return;
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [theme]);

  // Keep the browser chrome colour in step with the page.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
    if (bg) meta.setAttribute('content', `hsl(${bg})`);
  }, [resolved]);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    applyClass(next);
    setResolved(currentResolved());
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Choice just won't persist.
    }
  }, []);

  const cycle = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
