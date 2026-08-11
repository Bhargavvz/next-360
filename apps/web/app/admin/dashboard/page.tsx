'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileCheck, Users, Package, Shield, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/admin/stats')
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingStats = data ? [
    { label: 'Pending Certificates', value: data.pendingCertificates ?? 0, icon: FileCheck, color: 'text-amber-600 bg-amber-500/10', href: '/admin/certificates' },
    { label: 'Pending KYC', value: data.pendingKyc ?? 0, icon: Shield, color: 'text-orange-600 bg-orange-500/10', href: '/admin/kyc' },
    { label: 'Pending Sellers', value: data.pendingSellers ?? 0, icon: Users, color: 'text-blue-600 bg-blue-500/10', href: '/admin/sellers' },
    { label: 'Pending Products', value: data.pendingProducts ?? 0, icon: Package, color: 'text-purple-600 bg-purple-500/10', href: '/admin/products' },
  ] : [];

  const overviewStats = data ? [
    { label: 'Total Orders', value: data.totalOrders ?? 0, icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Active Sellers', value: `${data.activeSellers ?? 0}/${data.totalSellers ?? 0}`, icon: Users, color: 'text-blue-600 bg-blue-500/10', sublabel: 'approved' },
    { label: 'Approved Products', value: `${data.approvedProducts ?? 0}/${data.totalProducts ?? 0}`, icon: Package, color: 'text-purple-600 bg-purple-500/10', sublabel: 'total' },
    { label: 'Total Reviews', value: data.totalReviews ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-500/10' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and pending approvals</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Requires Attention
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pendingStats.map(stat => (
                <Link key={stat.label} href={stat.href}>
                  <Card className="hover:border-primary/30 transition-colors cursor-pointer hover:shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold">{stat.value}</p>
                          {stat.value > 0 && (
                            <p className="text-xs text-amber-600 font-medium mt-1">Needs review</p>
                          )}
                        </div>
                        <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${stat.color}`}>
                          <stat.icon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Platform Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map(stat => (
                <Card key={stat.label}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        {stat.sublabel && <p className="text-xs text-muted-foreground">{stat.sublabel}</p>}
                      </div>
                      <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {data?.ordersByStatus && Object.keys(data.ordersByStatus).length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Orders by Status</h2>
              <Card>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Object.entries(data.ordersByStatus).map(([status, count]) => (
                      <div key={status} className="text-center">
                        <p className="text-2xl font-bold">{count as number}</p>
                        <p className="text-xs text-muted-foreground mt-1">{status.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
