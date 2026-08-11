'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { publicApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, ShieldX, Star, Store, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VerifyProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    publicApi.get(`/api/v1/verify/${id}`)
      .then(res => setProduct(res.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
          <p className="text-muted-foreground mb-6">
            This product could not be verified. The QR code may be invalid, expired, or the product has been removed.
          </p>
          <Link href="/"><Button variant="outline">Back to Store</Button></Link>
        </div>
      </div>
    );
  }

  const isVerified = product.isVerifiedOrganic || product.verifiedOrganic;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-2xl border bg-card p-8">
        {/* Verification badge */}
        <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isVerified ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
          {isVerified ? (
            <ShieldCheck className="h-10 w-10 text-emerald-600" />
          ) : (
            <ShieldX className="h-10 w-10 text-amber-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-center font-[family-name:var(--font-outfit)] mb-1">
          {isVerified ? '✅ Verified Organic' : '⚠️ Not Verified'}
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          {isVerified
            ? 'This product has passed Next360 organic verification'
            : 'This product has not been organically certified yet'}
        </p>

        {/* Product info */}
        <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
          {product.primaryImageUrl && (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
          <div>
            <h2 className="font-semibold text-lg">{product.name}</h2>
            {product.sellerName && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Store className="h-3.5 w-3.5" /> {product.sellerName}
              </p>
            )}
          </div>

          {/* Checks */}
          <div className="space-y-2">
            {[
              { label: 'NPOP Certified', value: isVerified },
              { label: 'Seller KYC Verified', value: product.sellerVerified ?? false },
              { label: 'Certificate on File', value: isVerified },
              { label: 'Quality Checked', value: product.status === 'APPROVED' },
            ].map(check => (
              <div key={check.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{check.label}</span>
                {check.value ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>

          {product.rating > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{product.rating?.toFixed(1)}</span>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Link href={`/products/${product.slug || product.id}`} className="flex-1">
            <Button className="w-full">View Product</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Verified by Next360 • ID: {id}
        </p>
      </div>
    </div>
  );
}
