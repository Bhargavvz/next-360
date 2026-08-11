'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { SellerSidebar } from '@/components/seller/sidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth?redirect=/seller/dashboard');
      return;
    }
    // Allow access to register page always
    if (typeof window !== 'undefined' && window.location.pathname === '/seller/register') return;
    if (!hasRole('SELLER')) {
      router.replace('/seller/register');
    }
  }, [isAuthenticated, isLoading, hasRole]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <SellerSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
