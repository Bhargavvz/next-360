'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingCart, FileCheck, Shield,
  MessageSquare, BarChart3, ChevronLeft, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/seller/products', icon: Package },
  { label: 'Orders', href: '/seller/orders', icon: ShoppingCart },
  { label: 'Certificates', href: '/seller/certificates', icon: FileCheck },
  { label: 'KYC', href: '/seller/kyc', icon: Shield },
  { label: 'Reviews', href: '/seller/reviews', icon: MessageSquare },
  { label: 'Analytics', href: '/seller/analytics', icon: BarChart3 },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className={cn(
      'flex flex-col h-full bg-card border-r transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">N</div>
            <span className="text-sm font-bold font-display">Seller Portal</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to store */}
      <div className="p-2 border-t">
        <Link href="/" className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors')}>
          <ChevronLeft className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Back to Store</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center rounded-lg bg-background border shadow-sm">
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />}

      {/* Mobile sidebar */}
      <div className={cn('lg:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        {sidebar}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">{sidebar}</div>
    </>
  );
}
