'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileCheck, Users, Package, Shield, ChevronLeft, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Certificates', href: '/admin/certificates', icon: FileCheck },
  { label: 'Sellers', href: '/admin/sellers', icon: Users },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'KYC Review', href: '/admin/kyc', icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className={cn(
      'flex flex-col h-full bg-zinc-950 text-zinc-300 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">N</div>
            <span className="text-sm font-bold text-white font-[family-name:var(--font-outfit)]">Admin Panel</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

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
                isActive ? 'bg-primary/20 text-primary' : 'hover:bg-zinc-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-zinc-800">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-zinc-800 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Back to Store</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 text-white shadow-lg">
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />}
      <div className={cn('lg:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>{sidebar}</div>
      <div className="hidden lg:block shrink-0">{sidebar}</div>
    </>
  );
}
