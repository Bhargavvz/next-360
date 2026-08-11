'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = () => {
    api.get('/api/v1/cart')
      .then(res => { setCart(res.data.data); setError(null); })
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth'); return; }
    fetchCart();
  }, [isAuthenticated, authLoading]);

  // Backend expects ?quantity= query param, not a body
  const updateQty = async (id: string, qty: number) => {
    try { await api.put(`/api/v1/cart/${id}?quantity=${qty}`); fetchCart(); } catch {}
  };

  const removeItem = async (id: string) => {
    try { await api.delete(`/api/v1/cart/${id}`); fetchCart(); } catch {}
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) return;
    setPlacing(true);
    setError(null);
    try {
      // Build a simple order request — uses first available address or a placeholder
      const res = await api.post('/api/v1/orders', {
        shippingAddressId: null, // user needs address stored
        paymentMethod: 'COD',
        notes: '',
      });
      const orderId = res.data.data?.id;
      router.push(orderId ? `/orders/${orderId}` : '/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="container py-10 max-w-4xl">
        <Skeleton className="h-8 w-40 mb-8" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 mb-4 rounded-xl" />)}
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="container py-6 md:py-10 max-w-5xl">
      <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-8">
        Shopping Cart {items.length > 0 && <span className="text-muted-foreground text-lg">({items.length})</span>}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border bg-card">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some organic goodness to get started</p>
          <Link href="/products"><Button size="lg">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl border bg-card">
                <div className="h-24 w-24 rounded-xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl text-muted-foreground/30">🌿</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2">{item.productName}</h3>
                  {item.sellerName && <p className="text-xs text-muted-foreground mt-0.5">by {item.sellerName}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                        className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-l-lg transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-r-lg transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">₹{item.totalPrice?.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 sticky top-20 space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span>₹{cart.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{cart.totalAmount?.toLocaleString('en-IN')}</span>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                className="w-full shadow-lg shadow-primary/20"
                size="lg"
                onClick={handleCheckout}
                loading={placing}
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                🔒 Secure checkout • Free returns
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
