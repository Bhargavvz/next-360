'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Search, ShoppingBag, Heart, Menu, X, ChevronDown, LogOut, User,
  Package, LayoutDashboard, ShieldCheck, Store, MapPin,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle, ThemeToggleButton } from '@/components/ui/theme-toggle';
import { Logo } from '@/components/brand/logo';
import { SearchCommand } from '@/components/buyer/search-command';

const NAV_LINKS = [
  { href: '/products', label: 'Shop all' },
  { href: '/products?verified=true', label: 'Verified organic' },
  { href: '/products?productType=NATURAL', label: 'Natural' },
  { href: '/products?productType=ECO_FRIENDLY', label: 'Eco-friendly' },
];

export function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const refreshCart = useCallback(() => {
    if (!isAuthenticated) return setCartCount(0);
    api
      .get('/api/v1/cart')
      .then((r) => setCartCount(r.data.data?.items?.length ?? 0))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
    // Product cards fire this after adding, so the badge updates without a refetch loop.
    window.addEventListener('next360:cart-changed', refreshCart);
    return () => window.removeEventListener('next360:cart-changed', refreshCart);
  }, [refreshCart]);

  // The header only grows a border once the page has moved — at rest it sits
  // flush on the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ⌘K / Ctrl-K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isAdmin =
    hasRole('SUPER_ADMIN') ||
    hasRole('VERIFICATION_ADMIN') ||
    hasRole('OPERATIONS_ADMIN') ||
    hasRole('SUPPORT_ADMIN');

  return (
    <>
      {/* Announcement strip — the promise, stated once, above everything. */}
      <div className="hidden bg-primary text-primary-foreground md:block">
        <div className="container flex h-9 items-center justify-center gap-2 text-xs">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Every organic listing carries an NPOP certificate you can read yourself.</span>
          <Link href="/products?verified=true" className="font-medium underline underline-offset-2">
            Browse verified
          </Link>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 frost transition-shadow duration-250 ease-natural',
          scrolled ? 'border-b border-border shadow-xs' : 'border-b border-transparent'
        )}
      >
        <div className="container flex h-16 items-center gap-3">
          <Link href="/" aria-label="Next360 home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search trigger — a button, not an input, so ⌘K and click share one path. */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto hidden h-10 w-full max-w-xs items-center gap-2.5 rounded-full border border-border bg-surface-sunken px-4 text-sm text-subtle-foreground transition-colors hover:border-border-strong hover:bg-surface md:flex lg:max-w-sm"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search products</span>
            <kbd className="hidden shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-2xs text-subtle-foreground lg:inline">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex items-center gap-1 md:ml-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground md:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <ThemeToggle className="hidden md:inline-flex" />

            {isAuthenticated ? (
              <>
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className="hidden h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground sm:grid"
                >
                  <Heart className="h-[18px] w-[18px]" />
                </Link>

                <Link
                  href="/cart"
                  aria-label={`Cart, ${cartCount} items`}
                  className="relative grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {cartCount > 0 && (
                    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular text-primary-foreground animate-scale-in">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>

                <div className="relative ml-1">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    className="flex h-10 items-center gap-1.5 rounded-lg px-1.5 transition-colors hover:bg-surface-hover"
                  >
                    <Avatar src={user?.avatarUrl} alt={user?.name || 'Account'} size="sm" />
                    <ChevronDown
                      className={cn(
                        'hidden h-3.5 w-3.5 text-subtle-foreground transition-transform duration-200 sm:block',
                        userMenuOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div
                        role="menu"
                        className="absolute right-0 top-12 z-50 w-60 origin-top-right animate-scale-in rounded-xl border border-border bg-popover p-1.5 shadow-lg"
                      >
                        <div className="mb-1 border-b border-border px-3 pb-2.5 pt-1.5">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user?.name || 'Your account'}
                          </p>
                          <p className="truncate text-xs text-subtle-foreground">{user?.phone}</p>
                        </div>

                        <MenuLink href="/account" icon={User} label="Account" />
                        <MenuLink href="/orders" icon={Package} label="Orders" />
                        <MenuLink href="/account?tab=addresses" icon={MapPin} label="Addresses" />

                        {hasRole('SELLER') ? (
                          <MenuLink
                            href="/seller/dashboard"
                            icon={LayoutDashboard}
                            label="Seller dashboard"
                          />
                        ) : (
                          <MenuLink
                            href="/seller/register"
                            icon={Store}
                            label="Sell on Next360"
                            accent
                          />
                        )}
                        {isAdmin && (
                          <MenuLink href="/admin/dashboard" icon={ShieldCheck} label="Admin" />
                        )}

                        <div className="mt-1 border-t border-border pt-1">
                          <button
                            onClick={() => void logout()}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive-muted"
                          >
                            <LogOut className="h-4 w-4" /> Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggleButton className="md:hidden" />
                <Button size="sm" asChild>
                  <Link href="/auth">Sign in</Link>
                </Button>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={mobileOpen}
              className="grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-border bg-background lg:hidden">
            <nav className="container flex flex-col gap-0.5 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-border px-3 pt-3">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </header>

      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: typeof User;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-hover',
        accent ? 'font-medium text-primary' : 'text-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
