'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, AlertCircle, Package } from 'lucide-react';

const STATUS_FLOW: Record<string, { label: string; next: string }> = {
  PLACED: { label: 'Start Processing', next: 'PROCESSING' },
  PROCESSING: { label: 'Mark as Packed', next: 'PACKED' },
  PACKED: { label: 'Mark as Shipped', next: 'SHIPPED' },
  SHIPPED: { label: 'Mark as Delivered', next: 'DELIVERED' },
};

const STATUS_BADGE: Record<string, any> = {
  PLACED: 'warning', PROCESSING: 'default', PACKED: 'default',
  SHIPPED: 'default', DELIVERED: 'success', CANCELLED: 'destructive',
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchOrders = () => {
    api.get('/api/v1/seller/orders?size=50')
      .then(res => { setOrders(res.data.data?.content || []); setError(null); })
      .catch(err => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    setActing(id);
    try {
      // Backend: POST /api/v1/seller/orders/{id}/status?status=STATUS
      await api.post(`/api/v1/seller/orders/${id}/status?status=${status}`);
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActing(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Orders</h1>
        <p className="text-muted-foreground mt-1">Fulfill and track customer orders</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 rounded-xl border bg-card">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Orders from customers will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const action = STATUS_FLOW[order.status];
            return (
              <div key={order.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{order.orderNumber}</span>
                      <Badge variant={STATUS_BADGE[order.status] || 'outline'} className="text-[10px]">
                        {order.status?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {(order.buyerName || order.buyerPhone) && (
                      <p className="text-sm text-muted-foreground">
                        {order.buyerName}{order.buyerPhone && ` • ${order.buyerPhone}`}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm mt-1">
                      <span className="font-semibold">₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      {order.commissionAmount != null && (
                        <span className="text-muted-foreground">
                          Commission: ₹{order.commissionAmount?.toLocaleString('en-IN')}
                        </span>
                      )}
                      {order.netAmount != null && (
                        <span className="text-emerald-600 font-medium">
                          Net: ₹{order.netAmount?.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {order.trackingNumber && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {order.courierName && `${order.courierName}: `}{order.trackingNumber}
                      </p>
                    )}
                    {/* Items */}
                    {order.items?.length > 0 && (
                      <div className="mt-2 space-y-0.5">
                        {order.items.slice(0, 3).map((item: any) => (
                          <p key={item.id} className="text-xs text-muted-foreground">
                            • {item.productName} × {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{order.items.length - 3} more items</p>
                        )}
                      </div>
                    )}
                  </div>

                  {action && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(order.id, action.next)}
                      disabled={acting === order.id}
                      className="shrink-0"
                    >
                      {acting === order.id ? 'Updating…' : action.label}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
