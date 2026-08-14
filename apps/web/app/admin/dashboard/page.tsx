'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  Package, Users, FileCheck, Shield,
  IndianRupee, ShoppingCart, AlertTriangle,
  ArrowRight, Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/v1/admin/dashboard')
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
        <h2 className="text-lg font-semibold mb-1">Could not load dashboard</h2>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()}
          className="text-sm text-primary hover:underline">Try again</button>
      </div>
    );
  }

  const pendingItems = [
    {
      label: 'Pending Sellers',
      value: data?.pendingSellers ?? 0,
      icon: Users,
      color: 'text-warning bg-warning-muted',
      href: '/admin/sellers',
      urgent: (data?.pendingSellers ?? 0) > 0,
    },
    {
      label: 'Pending Products',
      value: data?.pendingProducts ?? 0,
      icon: Package,
      color: 'text-info bg-info/10',
      href: '/admin/products',
      urgent: (data?.pendingProducts ?? 0) > 0,
    },
    {
      label: 'Pending KYC',
      value: data?.pendingKyc ?? 0,
      icon: Shield,
      color: 'text-primary bg-violet-500/10',
      href: '/admin/kyc',
      urgent: (data?.pendingKyc ?? 0) > 0,
    },
    {
      label: 'Pending Certificates',
      value: data?.pendingCertificates ?? 0,
      icon: FileCheck,
      color: 'text-destructive bg-rose-500/10',
      href: '/admin/certificates',
      urgent: (data?.pendingCertificates ?? 0) > 0,
    },
  ];

  const platformStats = [
    {
      label: 'Total Revenue',
      value: data?.totalRevenue != null ? `₹${Number(data.totalRevenue).toLocaleString('en-IN')}` : '—',
      icon: IndianRupee,
      color: 'text-success bg-success-muted',
    },
    {
      label: 'Total Orders',
      value: data?.totalOrders ?? '—',
      icon: ShoppingCart,
      color: 'text-info bg-info/10',
    },
    {
      label: 'Total Sellers',
      value: data?.totalSellers ?? '—',
      sub: `${data?.activeSellers ?? 0} active`,
      icon: Users,
      color: 'text-primary bg-purple-500/10',
    },
    {
      label: 'Total Products',
      value: data?.totalProducts ?? '—',
      sub: `${data?.approvedProducts ?? 0} approved`,
      icon: Package,
      color: 'text-primary bg-teal-500/10',
    },
  ];

  const totalPending = pendingItems.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Platform overview and verification queue</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Activity className="h-3.5 w-3.5 text-success" />
          Live
        </div>
      </div>

      {/* Attention required banner */}
      {totalPending > 0 && (
        <div className="flex items-center gap-3 bg-warning-muted border border-warning/30 rounded-xl px-4 py-3.5">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-sm text-warning font-medium">
            {totalPending} item{totalPending !== 1 ? 's' : ''} require your review
          </p>
        </div>
      )}

      {/* Pending review queue */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Review Queue</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {pendingItems.map(item => (
            <Link key={item.href} href={item.href}>
              <div className={`relative rounded-2xl border p-5 bg-card hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer
                ${item.urgent ? 'border-warning/30 bg-warning-muted' : ''}`}>
                {item.urgent && (
                  <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-warning animate-pulse" />
                )}
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                  Review <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Platform stats */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Platform Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map(stat => (
            <div key={stat.label} className="rounded-2xl border bg-card p-5">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              {stat.sub && <p className="text-xs text-muted-foreground mt-0.5 opacity-70">{stat.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Order status breakdown */}
      {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Orders by Status</h2>
          <div className="rounded-2xl border bg-card p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(data.ordersByStatus).map(([status, count]: any) => (
                <div key={status} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    status === 'DELIVERED' ? 'bg-success' :
                    status === 'PENDING' ? 'bg-warning' :
                    status === 'CANCELLED' ? 'bg-rose-500' :
                    status === 'PROCESSING' ? 'bg-info' : 'bg-muted-foreground'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold">{count}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{status.replace(/_/g, ' ').toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Review Pending Sellers', sub: `${data?.pendingSellers ?? 0} awaiting approval`, href: '/admin/sellers', icon: Users },
            { label: 'Review Pending Products', sub: `${data?.pendingProducts ?? 0} awaiting approval`, href: '/admin/products', icon: Package },
            { label: 'Review KYC Documents', sub: `${data?.pendingKyc ?? 0} awaiting review`, href: '/admin/kyc', icon: Shield },
            { label: 'Review Certificates', sub: `${data?.pendingCertificates ?? 0} awaiting review`, href: '/admin/certificates', icon: FileCheck },
          ].map(action => (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
