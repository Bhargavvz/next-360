'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, MapPin, ChevronDown, Check,
  Tag, Leaf, ShieldCheck, CreditCard, Banknote, AlertCircle, X,
} from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import {
  loadRazorpay, openRazorpayCheckout, reportPaymentFailure, type PaymentInit,
} from '@/lib/razorpay';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Price, formatInr } from '@/components/ui/price';

type PaymentMethod = 'RAZORPAY' | 'COD';

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [addressOpen, setAddressOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('RAZORPAY');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = () =>
    api
      .get('/api/v1/cart')
      .then((res) => setCart(res.data.data))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/auth?redirect=/cart');
      return;
    }
    fetchCart();
    api
      .get('/api/v1/users/me/addresses')
      .then((r) => {
        const list = r.data.data ?? [];
        setAddresses(list);
        const preferred = list.find((a: any) => a.isDefault) ?? list[0];
        if (preferred) setAddressId(preferred.id);
      })
      .catch(() => {});
    loadRazorpay().catch(() => {});
  }, [isAuthenticated, authLoading, router]);

  const updateQty = async (id: string, qty: number) => {
    try {
      await api.put(`/api/v1/cart/${id}?quantity=${qty}`);
      await fetchCart();
      window.dispatchEvent(new CustomEvent('next360:cart-changed'));
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not update quantity'));
    }
  };

  const removeItem = async (id: string) => {
    try {
      await api.delete(`/api/v1/cart/${id}`);
      await fetchCart();
      window.dispatchEvent(new CustomEvent('next360:cart-changed'));
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not remove that item'));
    }
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await api.post('/api/v1/cart/coupon', {
        couponCode: couponInput.trim().toUpperCase(),
      });
      setCoupon(res.data.data);
      toast.success(`Coupon applied — you save ₹${formatInr(res.data.data.discountAmount)}`);
    } catch (err) {
      setCouponError(apiErrorMessage(err, 'Invalid coupon code'));
      setCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const checkout = async () => {
    if (!cart?.items?.length) return;
    if (!addressId) {
      const message =
        addresses.length === 0
          ? 'Add a delivery address before checking out'
          : 'Choose a delivery address';
      setError(message);
      toast.error(message);
      return;
    }

    setPlacing(true);
    setError(null);

    if (method === 'RAZORPAY') {
      try {
        await loadRazorpay();
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
        setPlacing(false);
        return;
      }
    }

    let orderId: string | undefined;
    let init: PaymentInit | undefined;

    try {
      const orderRes = await api.post('/api/v1/orders', {
        shippingAddressId: addressId,
        couponCode: coupon?.code ?? null,
        deliveryNotes: '',
        paymentMethod: method,
      });
      orderId = orderRes.data.data?.id;
      if (!orderId) throw new Error('Order could not be created');

      const initRes = await api.post(`/api/v1/payments/initiate/${orderId}`, { method });
      init = initRes.data.data as PaymentInit;
    } catch (err) {
      const message = apiErrorMessage(err, 'Could not start checkout. Please try again.');
      setError(message);
      toast.error(message);
      setPlacing(false);
      return;
    }

    window.dispatchEvent(new CustomEvent('next360:cart-changed'));

    if (method === 'COD') {
      toast.success('Order placed', { description: 'Pay in cash when it arrives.' });
      router.push(`/orders/${orderId}`);
      return;
    }

    const outcome = await openRazorpayCheckout(init);
    setPlacing(false);

    if (outcome.status === 'paid') {
      toast.success('Payment successful', { description: `Order ${init.orderNumber} confirmed.` });
      router.push(`/orders/${orderId}`);
      return;
    }

    const reason =
      outcome.status === 'dismissed' ? 'Payment cancelled by the customer' : outcome.reason;
    await reportPaymentFailure(orderId, init.gatewayOrderId, reason);
    if (outcome.status === 'dismissed') {
      toast('Payment cancelled', {
        description: `Order ${init.orderNumber} is saved — pay for it any time from your orders.`,
      });
    } else {
      toast.error('Payment failed', { description: reason });
    }
    router.push(`/orders/${orderId}`);
  };

  if (loading || authLoading) {
    return (
      <div className="container max-w-6xl py-10">
        <Skeleton className="mb-8 h-9 w-48" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const selected = addresses.find((a) => a.id === addressId);
  const subtotal = cart?.subtotal ?? 0;
  const shipping = cart?.shippingAmount ?? 0;
  const freeDeliveryLeft = cart?.freeDeliveryRemaining ?? 0;
  const discount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount + shipping);

  if (items.length === 0) {
    return (
      <div className="container max-w-3xl py-16">
        <EmptyState
          icon={<ShoppingBag />}
          title="Your cart is empty"
          description="Nothing here yet. Start with the products carrying a verified certificate."
          action={
            <Button asChild>
              <Link href="/products?verified=true">Shop verified organic</Link>
            </Button>
          }
          secondaryAction={
            <Button variant="secondary" asChild>
              <Link href="/products">Browse everything</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 md:py-12">
      <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
        Your cart
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-10">
        {/* ── Items + address ─────────────────────────────── */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item: any) => {
            const overStock = item.quantity > item.availableStock;
            return (
              <Card key={item.id} padding="sm" className="flex gap-4">
                <Link
                  href={`/products/${item.productSlug || item.productId}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-sunken"
                >
                  {item.productImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <Leaf className="h-7 w-7 text-border-strong" strokeWidth={1.25} />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.productSlug || item.productId}`}
                        className="line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {item.productName}
                      </Link>
                      {item.variantValue && (
                        <p className="mt-0.5 text-xs text-subtle-foreground">
                          {item.variantName}: {item.variantValue}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.productName}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-subtle-foreground transition-colors hover:bg-destructive-muted hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {overStock && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-warning">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Only {item.availableStock} left — reduce the quantity to continue
                    </p>
                  )}

                  <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                    <div className="flex h-9 items-center rounded-lg border border-border">
                      <button
                        onClick={() => updateQty(item.id, Math.max(1, item.quantity - 1))}
                        aria-label="Decrease quantity"
                        className="grid h-full w-9 place-items-center rounded-l-lg transition-colors hover:bg-surface-hover"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium tabular">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.availableStock}
                        aria-label="Increase quantity"
                        className="grid h-full w-9 place-items-center rounded-r-lg transition-colors hover:bg-surface-hover disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Price value={item.lineTotal} size="md" />
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Delivery address */}
          <Card padding="md">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Delivery address
              </h2>
              <Link
                href="/account?tab=addresses"
                className="text-xs text-primary transition-colors hover:text-primary-hover"
              >
                Manage
              </Link>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-surface-sunken p-4">
                <p className="text-sm text-muted-foreground">No addresses saved yet</p>
                <Button size="sm" variant="secondary" asChild>
                  <Link href="/account?tab=addresses">Add an address</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setAddressOpen((v) => !v)}
                  aria-expanded={addressOpen}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3.5 text-left transition-colors hover:border-border-strong"
                >
                  {selected ? (
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        {selected.name}
                        <Badge variant="outline" size="sm">
                          {selected.type}
                        </Badge>
                        {selected.isDefault && (
                          <Badge variant="primary" size="sm">
                            Default
                          </Badge>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {selected.addressLine1}, {selected.city} — {selected.pincode}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Choose an address</span>
                  )}
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-subtle-foreground transition-transform',
                      addressOpen && 'rotate-180'
                    )}
                  />
                </button>

                {addressOpen && (
                  <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                    {addresses.map((addr: any) => (
                      <button
                        key={addr.id}
                        onClick={() => {
                          setAddressId(addr.id);
                          setAddressOpen(false);
                          setError(null);
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-surface-hover',
                          addressId === addr.id && 'bg-primary-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2',
                            addressId === addr.id
                              ? 'border-primary bg-primary'
                              : 'border-border-strong'
                          )}
                        >
                          {addressId === addr.id && (
                            <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={4} />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                            {addr.name}
                            <Badge variant="outline" size="sm">
                              {addr.type}
                            </Badge>
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {addr.addressLine1}, {addr.city} — {addr.pincode}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ── Summary ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Card variant="raised" padding="lg" className="lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold text-foreground">Order summary</h2>

            {/* Coupon */}
            <div className="mt-5">
              {coupon ? (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-success/30 bg-success-muted px-3 py-2.5">
                  <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium text-success">
                    <Tag className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{coupon.code}</span>
                  </span>
                  <button
                    onClick={() => {
                      setCoupon(null);
                      setCouponInput('');
                    }}
                    aria-label="Remove coupon"
                    className="text-subtle-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                      placeholder="Coupon code"
                      className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-surface px-3 text-sm uppercase tracking-wide text-foreground placeholder:normal-case placeholder:tracking-normal placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-10"
                      onClick={applyCoupon}
                      loading={applyingCoupon}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="mt-1.5 text-xs text-destructive">{couponError}</p>
                  )}
                </>
              )}
            </div>

            {/* Totals */}
            <dl className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular text-foreground">₹{formatInr(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className={cn('tabular', shipping > 0 ? 'text-foreground' : 'text-success')}>
                  {shipping > 0 ? `₹${formatInr(shipping)}` : 'Free'}
                </dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Coupon discount</dt>
                  <dd className="tabular">−₹{formatInr(discount)}</dd>
                </div>
              )}
            </dl>

            {freeDeliveryLeft > 0 && (
              <p className="mt-3 rounded-lg bg-primary-muted px-3 py-2 text-xs text-primary">
                Add ₹{formatInr(freeDeliveryLeft)} more for free delivery
              </p>
            )}

            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-display text-2xl font-semibold tabular text-foreground">
                ₹{formatInr(total)}
              </span>
            </div>

            {/* Payment method */}
            <div className="mt-6">
              <p className="mb-2.5 text-sm font-medium text-foreground">Payment</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'RAZORPAY', label: 'Pay online', hint: 'UPI · cards', Icon: CreditCard },
                    { id: 'COD', label: 'Cash on delivery', hint: 'Pay later', Icon: Banknote },
                  ] as const
                ).map(({ id, label, hint, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setMethod(id)}
                    aria-pressed={method === id}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-all duration-200 ease-natural',
                      method === id
                        ? 'border-primary bg-primary-muted'
                        : 'border-border hover:border-border-strong'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mb-1.5 h-4 w-4',
                        method === id ? 'text-primary' : 'text-subtle-foreground'
                      )}
                    />
                    <span className="block text-xs font-medium leading-tight text-foreground">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-2xs leading-tight text-subtle-foreground">
                      {hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mt-4 flex items-start gap-2 rounded-lg bg-destructive-muted px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}

            <Button
              block
              size="lg"
              className="mt-5"
              onClick={checkout}
              loading={placing}
              disabled={!addressId}
            >
              {method === 'COD' ? 'Place order' : `Pay ₹${formatInr(total)}`}
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-subtle-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              {method === 'COD' ? 'Pay in cash on delivery' : 'Secured by Razorpay'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
