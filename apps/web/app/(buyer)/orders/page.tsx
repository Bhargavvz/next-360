'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const statusColors: Record<string, string> = {
  PLACED: 'warning',
  PAYMENT_CONFIRMED: 'default',
  PROCESSING: 'default',
  PACKED: 'default',
  SHIPPED: 'default',
  OUT_FOR_DELIVERY: 'default',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  RETURNED: 'destructive',
  REFUNDED: 'destructive',
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth'); return; }
    api.get('/api/v1/orders?size=50')
      .then(res => setOrders(res.data.data?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="container py-10 max-w-3xl">
        <Skeleton className="h-8 w-32 mb-8" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 mb-4 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Start shopping to see your orders here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block group">
              <div className="flex items-center gap-4 p-5 rounded-xl border bg-card hover:shadow-md hover:border-primary/20 transition-all">
                <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-muted">
                  {order.firstProductImage ? (
                    <img src={order.firstProductImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center"><Package className="h-6 w-6 text-muted-foreground" /></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{order.orderNumber}</span>
                    <Badge variant={statusColors[order.status] as any || 'outline'} className="text-[10px]">{order.status?.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {order.firstProductName}{order.itemCount > 1 ? ` +${order.itemCount - 1} more` : ''}
                  </p>
                  <p className="text-sm font-semibold mt-1">₹{order.finalAmount?.toLocaleString('en-IN')}</p>
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
