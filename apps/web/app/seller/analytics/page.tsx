'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ShoppingBag, DollarSign, Star, Package, CheckCircle, Clock, XCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  PLACED: '#3b82f6', PAYMENT_CONFIRMED: '#6366f1', PROCESSING: '#8b5cf6',
  PACKED: '#0ea5e9', SHIPPED: '#f59e0b', OUT_FOR_DELIVERY: '#10b981',
  DELIVERED: '#16a34a', CANCELLED: '#ef4444', RETURNED: '#f97316',
};

export default function SellerAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/v1/seller/analytics')
      .then(r => setAnalytics(r.data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 text-destructive p-6 rounded-2xl border bg-card">
        <XCircle className="h-5 w-5 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Revenue', value: `₹${analytics?.totalRevenue?.toLocaleString('en-IN') || 0}`,
      icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50',
    },
    {
      label: 'Net Earnings', value: `₹${analytics?.netEarnings?.toLocaleString('en-IN') || 0}`,
      icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50',
    },
    {
      label: 'Total Orders', value: analytics?.totalOrders || 0,
      icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50',
    },
    {
      label: 'Avg. Rating', value: analytics?.averageRating ? Number(analytics.averageRating).toFixed(1) : '—',
      icon: Star, color: 'text-amber-500', bg: 'bg-amber-50',
    },
  ];

  const ordersByStatus: Record<string, number> = analytics?.ordersByStatus || {};
  const totalOrders = Object.values(ordersByStatus).reduce((a, b) => a + b, 0) || 1;

  const statusItems = Object.entries(ordersByStatus).sort(([,a],[,b]) => b - a);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Analytics</h1>
        <p className="text-muted-foreground mt-1">Your store performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold font-[family-name:var(--font-outfit)]">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue breakdown */}
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-5">Revenue Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: 'Gross Revenue', value: analytics?.totalRevenue, icon: DollarSign, color: 'text-emerald-600' },
              { label: 'Platform Commission', value: analytics?.totalCommission, icon: Package, color: 'text-destructive' },
              { label: 'Net Earnings', value: analytics?.netEarnings, icon: TrendingUp, color: 'text-blue-600' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <row.icon className={`h-4 w-4 ${row.color}`} />
                  <span className="text-sm">{row.label}</span>
                </div>
                <span className={`font-semibold ${row.color}`}>₹{row.value?.toLocaleString('en-IN') || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products overview */}
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-5">Catalogue Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Products', value: analytics?.totalProducts, icon: Package, color: 'text-primary' },
              { label: 'Approved Products', value: analytics?.approvedProducts, icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'Pending Review', value: (analytics?.totalProducts || 0) - (analytics?.approvedProducts || 0), icon: Clock, color: 'text-amber-500' },
              { label: 'Total Reviews', value: analytics?.totalReviews, icon: Star, color: 'text-amber-400' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <row.icon className={`h-4 w-4 ${row.color}`} />
                  <span className="text-sm">{row.label}</span>
                </div>
                <span className="font-semibold">{row.value || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      {statusItems.length > 0 && (
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="font-semibold mb-5">Orders by Status</h2>
          <div className="space-y-3">
            {statusItems.map(([status, count]) => {
              const pct = Math.round((count / totalOrders) * 100);
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium">{status.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{count} orders ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || '#6b7280' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed vs Pending */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <p className="text-3xl font-bold">{analytics?.completedOrders || 0}</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-3xl font-bold">{analytics?.pendingOrders || 0}</p>
        </div>
      </div>
    </div>
  );
}
