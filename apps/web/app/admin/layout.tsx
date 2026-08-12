'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  const isAdmin = hasRole('SUPER_ADMIN') || hasRole('VERIFICATION_ADMIN') || hasRole('OPERATIONS_ADMIN') || hasRole('SUPPORT_ADMIN') || hasRole('ADMIN');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/auth?redirect=/admin/dashboard');
      return;
    }
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
