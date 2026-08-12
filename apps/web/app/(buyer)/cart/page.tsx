'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertCircle, MapPin, ChevronDown, Check, Tag, Leaf, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddresses, setShowAddresses] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = () =>
    api.get('/api/v1/cart')
      .then(res => { setCart(res.data.data); setError(null); })
      .catch(() => setCart(null))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push('/auth'); return; }
    fetchCart();
    api.get('/api/v1/users/me/addresses').then(r => {
      const addrs = r.data.data || [];
      setAddresses(addrs);
      const def = addrs.find((a: any) => a.isDefault) || addrs[0];
      if (def) setSelectedAddressId(def.id);
    }).catch(() => {});
  }, [isAuthenticated, authLoading]);

  const updateQty = async (id: string, qty: number) => {
    try { await api.put(`/api/v1/cart/${id}?quantity=${qty}`); fetchCart(); } catch {}
  };

  const removeItem = async (id: string) => {
    try { await api.delete(`/api/v1/cart/${id}`); fetchCart(); } catch {}
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true); setCouponError(''); setCouponApplied(null);
    try {
      const res = await api.post('/api/v1/cart/coupon', { couponCode: couponCode.trim().toUpperCase() });
      setCouponApplied(res.data.data);
      fetchCart();
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally { setApplyingCoupon(false); }
  };

  const handleRemoveCoupon = async () => {
    await api.delete('/api/v1/cart/coupon').catch(() => {});
    setCouponApplied(null); setCouponCode(''); fetchCart();
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) return;
    if (!selectedAddressId && addresses.length > 0) {
      toast.error('Please select a delivery address');
      return;
    }
    
    if (!window.Razorpay) {
      toast.error('Payment system is still loading. Please try again in a moment.');
      return;
    }

    setPlacing(true); setError(null);
    try {
      // 1. Create order
      const res = await api.post('/api/v1/orders', {
        shippingAddressId: selectedAddressId || null,
        couponCode: couponApplied?.code || null,
        deliveryNotes: '',
      });
      const orderId = res.data.data?.id;
      if (!orderId) throw new Error('Order creation failed');

      // 2. Initiate payment
      const initRes = await api.post(`/api/v1/payments/initiate/${orderId}`);
      const { gatewayOrderId, amount, keyId } = initRes.data.data;

      // 3. Open Razorpay modal
      const options = {
        key: keyId,
        amount: Math.round(amount * 100), // convert INR to paise for display
        currency: 'INR',
        name: 'Next360',
        description: 'Order Payment',
        order_id: gatewayOrderId,
        handler: async function (response: any) {
          try {
            // 4. Verify payment
            await api.post('/api/v1/payments/verify', {
              orderId,
              gatewayPaymentId: response.razorpay_payment_id,
              gatewayOrderId: response.razorpay_order_id,
              gatewaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            router.push(`/orders/${orderId}`);
          } catch (verifyErr: any) {
            toast.error('Payment verification failed');
            router.push('/orders');
          }
        },
        theme: {
          color: '#10b981', // emerald-500
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate checkout. Please try again.');
    } finally { setPlacing(false); }
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
  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  const discount = couponApplied?.discountAmount || 0;
  const total = Math.max(0, (cart?.totalAmount || 0) - discount);

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
                  {item.productImageUrl
                    ? <img src={item.productImageUrl} alt="" className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center"><Leaf className="h-8 w-8 text-muted-foreground/20" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productSlug || item.productId}`} className="font-medium hover:text-primary line-clamp-2">{item.productName}</Link>
                  {item.sellerName && <p className="text-xs text-muted-foreground mt-0.5">by {item.sellerName}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))} className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-l-lg transition-colors">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, item.quantity + 1)} className="h-9 w-9 flex items-center justify-center hover:bg-accent rounded-r-lg transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">₹{item.totalPrice?.toLocaleString('en-IN')}</span>
                      <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Delivery Address */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Delivery Address</h2>
                <Link href="/account" className="text-xs text-primary hover:underline">Manage Addresses</Link>
              </div>

              {addresses.length === 0 ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-dashed">
                  <p className="text-sm text-muted-foreground">No addresses saved</p>
                  <Link href="/account?tab=addresses"><Button size="sm" variant="outline">Add Address</Button></Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => setShowAddresses(!showAddresses)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors text-left">
                    <div>
                      {selectedAddress ? (
                        <>
                          <p className="text-sm font-medium">{selectedAddress.name} · <span className="text-muted-foreground">{selectedAddress.type}</span></p>
                          <p className="text-xs text-muted-foreground">{selectedAddress.addressLine1}, {selectedAddress.city} — {selectedAddress.pincode}</p>
                        </>
                      ) : <p className="text-sm text-muted-foreground">Select delivery address</p>}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showAddresses ? 'rotate-180' : ''}`} />
                  </button>
                  {showAddresses && (
                    <div className="border rounded-lg overflow-hidden divide-y">
                      {addresses.map((addr: any) => (
                        <button key={addr.id} onClick={() => { setSelectedAddressId(addr.id); setShowAddresses(false); }}
                          className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left ${selectedAddressId === addr.id ? 'bg-primary/5' : ''}`}>
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                            {selectedAddressId === addr.id && <Check className="h-2.5 w-2.5 text-white" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{addr.name} <Badge variant="outline" className="text-[9px] ml-1">{addr.type}</Badge>{addr.isDefault && <Badge variant="organic" className="text-[9px] ml-1">DEFAULT</Badge>}</p>
                            <p className="text-xs text-muted-foreground">{addr.addressLine1}, {addr.city} — {addr.pincode}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 sticky top-20 space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>

              {/* Coupon */}
              {couponApplied ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <span className="text-sm text-emerald-700 font-medium flex items-center gap-1.5">
                    <Tag className="h-4 w-4" />{couponApplied.code} applied
                  </span>
                  <button onClick={handleRemoveCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" placeholder="Coupon code" value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background" />
                  <Button size="sm" variant="outline" onClick={handleApplyCoupon} loading={applyingCoupon}>Apply</Button>
                </div>
              )}
              {couponError && <p className="text-xs text-destructive -mt-2">{couponError}</p>}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span>₹{cart.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon discount</span>
                    <span>−₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />{error}
                </div>
              )}

              <Button className="w-full shadow-lg shadow-primary/20" size="lg" onClick={handleCheckout} loading={placing}>
                Place Order <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure payments powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
