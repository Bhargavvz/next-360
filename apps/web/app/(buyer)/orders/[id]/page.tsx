'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, MapPin, Package, X } from 'lucide-react';
import Link from 'next/link';

const statusSteps = ['PLACED', 'PAYMENT_CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth'); return; }
    api.get(`/api/v1/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, authLoading]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await api.post(`/api/v1/orders/${id}/cancel`);
      setOrder(res.data.data);
    } catch {}
    setCancelling(false);
  };

  if (loading || authLoading) {
    return (
      <div className="container py-10 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 rounded-xl mb-6" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return <div className="container py-20 text-center"><h2 className="text-xl font-bold">Order not found</h2></div>;
  }

  const currentStep = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'RETURNED' || order.status === 'REFUNDED';

  return (
    <div className="container py-6 md:py-10 max-w-3xl">
      {/* Header */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/orders" className="hover:text-foreground">Orders</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{order.orderNumber}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {order.status === 'PLACED' && (
          <Button variant="outline" size="sm" onClick={handleCancel} loading={cancelling} className="text-destructive hover:bg-destructive/10">
            <X className="h-4 w-4" /> Cancel
          </Button>
        )}
      </div>

      {/* Progress */}
      {!isCancelled && (
        <div className="rounded-xl border bg-card p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            {statusSteps.slice(0, 5).map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`h-3 w-3 rounded-full ${i <= currentStep ? 'bg-primary' : 'bg-muted'} transition-colors`} />
                <span className={`text-[10px] mt-1.5 text-center ${i <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {step.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 rounded bg-muted mt-1">
            <div className="absolute h-1 rounded bg-primary transition-all" style={{ width: `${Math.min(100, (currentStep / 4) * 100)}%` }} />
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6 text-center">
          <Badge variant="destructive">{order.status.replace(/_/g, ' ')}</Badge>
        </div>
      )}

      {/* Items */}
      <div className="rounded-xl border bg-card divide-y mb-6">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-muted">
              {item.productImageUrl ? (
                <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
              {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
              <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.unitPrice}</p>
            </div>
            <span className="font-semibold text-sm shrink-0">₹{item.totalPrice?.toLocaleString('en-IN')}</span>
          </div>
        ))}
      </div>

      {/* Summary + Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <h3 className="font-semibold text-sm">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-emerald-600">-₹{order.discountAmount}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shippingAmount > 0 ? `₹${order.shippingAmount}` : 'Free'}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>₹{order.finalAmount?.toLocaleString('en-IN')}</span></div>
          </div>
          <Badge variant={order.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}>{order.paymentStatus}</Badge>
        </div>

        {order.shippingAddress && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Shipping Address</h3>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
