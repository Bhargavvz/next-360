'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Search, ShoppingCart, Heart, Menu, X, ChevronDown, LogOut, User, Package, LayoutDashboard, ShieldCheck, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function Navbar() {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setCartCount(0); return; }
    api.get('/api/v1/cart').then(r => {
      setCartCount(r.data.data?.items?.length || 0);
    }).catch(() => { });
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/products?query=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105">
            N
          </div>
          <span className="text-xl font-bold tracking-tight font-[family-name:var(--font-outfit)]">
            Next<span className="text-primary">360</span>
          </span>
        </Link>

        {/* Search bar — desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for organic products..."
              className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-muted/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
            />
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/wishlist" className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent transition-colors relative">
                <Heart className="h-5 w-5" />
              </Link>
              <Link href="/cart" className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-accent transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 h-10 px-2 rounded-full hover:bg-accent transition-colors"
                >
                  <Avatar src={user?.avatarUrl} alt={user?.name || 'User'} size="sm" />
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border bg-card p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95">
                      <div className="px-3 py-2 border-b mb-1">
                        <p className="text-sm font-medium">{user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.phone}</p>
                      </div>
                      <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                        <User className="h-4 w-4" /> Account
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                        <Package className="h-4 w-4" /> Orders
                      </Link>
                      {hasRole('SELLER') ? (
                        <Link href="/seller/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                          <LayoutDashboard className="h-4 w-4" /> Seller Dashboard
                        </Link>
                      ) : (
                        <Link href="/seller/register" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors text-primary font-medium">
                          <Store className="h-4 w-4" /> Become a Seller
                        </Link>
                      )}
                      {(hasRole('SUPER_ADMIN') || hasRole('ADMIN') || hasRole('VERIFICATION_ADMIN') || hasRole('OPERATIONS_ADMIN')) && (
                        <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                          <LayoutDashboard className="h-4 w-4" /> Admin Panel
                        </Link>
                      )}
                      <div className="border-t mt-1 pt-1">
                        <button onClick={logout} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth">
              <Button size="sm">Login</Button>
            </Link>
          )}

          {/* Mobile menu */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-accent">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile search + nav */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-3 bg-background animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search products..." className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-muted/40 text-sm" />
          </div>
          <nav className="flex flex-col gap-1">
            <Link href="/products" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-lg hover:bg-accent">All Products</Link>
            <Link href="/products?verified=true" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-lg hover:bg-accent text-primary font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Organic
            </Link>
            {isAuthenticated && !hasRole('SELLER') && (
              <Link href="/seller/register" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-lg hover:bg-accent text-primary font-medium flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" /> Become a Seller
              </Link>
            )}
            {isAuthenticated && hasRole('SELLER') && (
              <Link href="/seller/dashboard" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm rounded-lg hover:bg-accent flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" /> Seller Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
