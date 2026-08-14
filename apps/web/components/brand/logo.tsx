import { cn } from '@/lib/utils';

/**
 * The mark: a leaf enclosed in a ring.
 *
 * The ring is the "360" — a complete, closed loop standing for full-circle
 * traceability — and the leaf inside is what is being vouched for. Drawn as
 * geometry rather than set as a letter so it holds up at favicon size and as an
 * app icon, where a glyph would turn to mush.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={cn('h-8 w-8', className)} aria-hidden>
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        /* Gap at the top-right: an opening in the loop that reads as motion,
           and keeps the mark from looking like a generic "certified" stamp. */
        strokeDasharray="72 16"
        strokeDashoffset="18"
      />
      <path
        d="M16 23c0-5 2.5-8.5 7-10-.5 5.5-3 9-7 10Z"
        fill="currentColor"
      />
      <path
        d="M16 23c0-4-2-7-5.5-8.5C11 19 13 22 16 23Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className="h-8 w-8 text-primary" />
      {showWordmark && (
        <span className="font-display text-xl font-semibold tracking-tight text-foreground">
          Next<span className="text-primary">360</span>
        </span>
      )}
    </span>
  );
}
