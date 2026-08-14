'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, CornerDownLeft, Loader2, Leaf, TrendingUp } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Price } from '@/components/ui/price';
import { VerifiedSeal } from '@/components/brand/trust-mark';

interface Suggestion {
  id: string;
  slug: string;
  name: string;
  price: number;
  mrp?: number | null;
  primaryImageUrl?: string | null;
  isVerifiedOrganic?: boolean;
  sellerName?: string;
}

const QUICK_LINKS = [
  { label: 'Verified organic only', href: '/products?verified=true' },
  { label: 'Cold-pressed oils', href: '/products?query=oil' },
  { label: 'Raw honey', href: '/products?query=honey' },
  { label: 'Millets & grains', href: '/products?query=millet' },
];

/**
 * Search overlay, opened by the header field or ⌘K.
 *
 * Results are fetched as you type with a 220ms debounce and a request counter
 * that discards out-of-order responses — without it a slow early request can
 * land after a fast later one and overwrite good results with stale ones.
 */
export function SearchCommand({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) {
      // Focus after the open transition so the caret doesn't jump.
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    setQuery('');
    setResults([]);
    setActive(0);
  }, [open]);

  // Lock body scroll while the overlay is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const id = ++requestId.current;
    const timer = setTimeout(async () => {
      try {
        const res = await publicApi.get(
          `/api/v1/search?query=${encodeURIComponent(term)}&size=6`
        );
        if (id !== requestId.current) return; // a newer query already won
        setResults(res.data.data?.content ?? []);
        setActive(0);
      } catch {
        if (id === requestId.current) setResults([]);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const go = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onClose();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(`/products/${hit.slug || hit.id}`);
      else if (query.trim()) go(`/products?query=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal aria-label="Search products">
      <div
        className="absolute inset-0 bg-foreground/25 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative mx-auto mt-[8vh] w-[min(46rem,calc(100vw-2rem))] animate-in fade-up">
        <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          {/* Field */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search className="h-4.5 w-4.5 shrink-0 text-subtle-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search honey, millets, cold-pressed oils…"
              className="h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-subtle-foreground"
            />
            {loading && <Loader2 className="h-4 w-4 animate-spin text-subtle-foreground" />}
            <button
              onClick={onClose}
              aria-label="Close search"
              className="grid h-7 w-7 place-items-center rounded-md text-subtle-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[min(28rem,60vh)] overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <div className="p-2">
                <p className="px-2 py-1.5 text-2xs font-medium uppercase tracking-wider text-subtle-foreground">
                  Popular
                </p>
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => go(link.href)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
                  >
                    <TrendingUp className="h-4 w-4 text-subtle-foreground" />
                    {link.label}
                  </button>
                ))}
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Nothing matched “<span className="text-foreground">{query}</span>”
                </p>
                <button
                  onClick={() => go(`/products?query=${encodeURIComponent(query.trim())}`)}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Search the full catalogue
                </button>
              </div>
            ) : (
              <>
                {results.map((item, i) => (
                  <button
                    key={item.id}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(`/products/${item.slug || item.id}`)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors',
                      i === active ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                    )}
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-sunken">
                      {item.primaryImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.primaryImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Leaf className="h-5 w-5 text-border-strong" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
                        {item.name}
                        {item.isVerifiedOrganic && <VerifiedSeal size="sm" showLabel={false} />}
                      </p>
                      {item.sellerName && (
                        <p className="truncate text-xs text-subtle-foreground">{item.sellerName}</p>
                      )}
                    </div>

                    <Price value={item.price} mrp={item.mrp} size="sm" />
                    {i === active && (
                      <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-subtle-foreground" />
                    )}
                  </button>
                ))}

                <button
                  onClick={() => go(`/products?query=${encodeURIComponent(query.trim())}`)}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border-t border-border px-2 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-hover"
                >
                  See all results for “{query.trim()}”
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-3 hidden justify-center gap-4 text-xs text-background/70 md:flex">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-border/40 bg-surface/20 px-1.5 py-0.5 font-sans">↑↓</kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-border/40 bg-surface/20 px-1.5 py-0.5 font-sans">↵</kbd>
            open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-border/40 bg-surface/20 px-1.5 py-0.5 font-sans">esc</kbd>
            close
          </span>
        </p>
      </div>
    </div>
  );
}
