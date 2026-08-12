'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { SellerSidebar } from '@/components/seller/sidebar';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isRegisterPage = pathname === '/seller/register';

  useEffect(() => {
    if (isLoading) return;

    // Register page: only needs authentication, not SELLER role
    if (isRegisterPage) {
      if (!isAuthenticated) {
        router.replace('/auth?redirect=/seller/register');
      }
      return;
    }

    // All other seller pages: need authentication + SELLER role
    if (!isAuthenticated) {
      router.replace('/auth?redirect=/seller/dashboard');
      return;
    }
    if (!hasRole('SELLER')) {
      router.replace('/seller/register');
    }
  }, [isAuthenticated, isLoading, hasRole, isRegisterPage, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Register page renders without sidebar — standalone full-page layout
  if (isRegisterPage) {
    return <>{children}</>;
  }

  // All other seller pages need the sidebar layout
  if (!isAuthenticated || !hasRole('SELLER')) {
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
