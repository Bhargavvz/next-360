'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IndianRupee, Package, ShoppingCart, TrendingUp, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SellerDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNotSeller, setIsNotSeller] = useState(false);

  useEffect(() => {
    api.get('/api/v1/seller/analytics')
      .then(res => setAnalytics(res.data.data))
      .catch(err => {
        if (err.response?.status === 403 || err.response?.status === 404) {
          setIsNotSeller(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (isNotSeller) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-5xl mb-4">🏪</div>
        <h1 className="text-2xl font-bold mb-2">You're not a seller yet</h1>
        <p className="text-muted-foreground mb-6">Register as a seller to start listing your organic products on Next360.</p>
        <Link href="/seller/register"><Button size="lg">Become a Seller</Button></Link>
      </div>
    );
  }

  const stats = analytics ? [
    { label: 'Total Revenue', value: `₹${analytics.totalRevenue?.toLocaleString('en-IN') || '0'}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-500/10', change: analytics.revenueGrowth ? `${analytics.revenueGrowth > 0 ? '+' : ''}${analytics.revenueGrowth}%` : null },
    { label: 'Net Earnings', value: `₹${analytics.netEarnings?.toLocaleString('en-IN') || '0'}`, icon: TrendingUp, color: 'text-blue-600 bg-blue-500/10' },
    { label: 'Total Orders', value: analytics.totalOrders ?? 0, icon: ShoppingCart, color: 'text-purple-600 bg-purple-500/10' },
    { label: 'Pending Orders', value: analytics.pendingOrders ?? 0, icon: Clock, color: analytics.pendingOrders > 0 ? 'text-amber-600 bg-amber-500/10' : 'text-muted-foreground bg-muted/50' },
    { label: 'Products (Approved)', value: `${analytics.approvedProducts ?? 0} / ${analytics.totalProducts ?? 0}`, icon: Package, color: 'text-rose-600 bg-rose-500/10', sublabel: 'approved / total' },
    { label: 'Average Rating', value: analytics.averageRating ? Number(analytics.averageRating).toFixed(1) : 'N/A', icon: Star, color: 'text-yellow-600 bg-yellow-500/10' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your store performance</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && <p className="text-xs text-emerald-600 font-medium mt-1">{stat.change}</p>}
                    {stat.sublabel && <p className="text-xs text-muted-foreground mt-1">{stat.sublabel}</p>}
                  </div>
                  <div className={`h-12 w-12 flex items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {analytics && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/seller/products/new"><Button variant="outline" className="w-full justify-start">+ Add New Product</Button></Link>
                <Link href="/seller/orders"><Button variant="outline" className="w-full justify-start">📋 Manage Orders {analytics.pendingOrders > 0 && `(${analytics.pendingOrders} pending)`}</Button></Link>
                <Link href="/seller/certificates"><Button variant="outline" className="w-full justify-start">🏅 Upload Certificate</Button></Link>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Earnings Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Revenue</span>
                  <span className="font-medium">₹{analytics.totalRevenue?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission ({analytics.commissionPercentage || 15}%)</span>
                  <span className="font-medium text-destructive">-₹{analytics.totalCommission?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Net Earnings</span>
                  <span className="text-emerald-600">₹{analytics.netEarnings?.toLocaleString('en-IN') || '0'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
