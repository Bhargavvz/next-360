'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, ShieldAlert, ArrowRight, Leaf, Store, Calendar, FileCheck, Info,
} from 'lucide-react';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Price } from '@/components/ui/price';
import { Logo } from '@/components/brand/logo';
import { CertificateId, TypeMark, PRODUCT_TYPES, type ProductType } from '@/components/brand/trust-mark';

/**
 * Public certificate page — the destination of the QR code on a pack.
 *
 * This is the moment the whole product is selling, so it is designed as a
 * verdict, not a page: one unmissable answer at the top, the evidence beneath
 * it, and no marketing chrome competing for attention. It renders standalone
 * (outside the buyer layout) because people arrive here from a phone camera,
 * often before they have ever seen the site.
 */
export default function VerifyPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    publicApi
      .get(`/api/v1/verify/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-9 w-64" />
        <Skeleton className="mt-10 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const verified = !failed && !!product?.isVerifiedOrganic;
  const typeConfig = product?.productType
    ? PRODUCT_TYPES[product.productType as ProductType]
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link href="/" aria-label="Next360 home">
            <Logo />
          </Link>
          <span className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
            Certificate check
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-20">
        {/* ── The verdict ──────────────────────────────────
            Stated in plain language before any detail. Someone standing in a
            shop needs the answer in under a second. */}
        <section
          className={`mt-10 rounded-2xl border p-8 text-center ${
            verified ? 'border-seal-border bg-seal-muted' : 'border-border bg-surface'
          }`}
        >
          <div
            className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
              verified ? 'bg-seal text-seal-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {verified ? (
              <ShieldCheck className="h-8 w-8" strokeWidth={2.25} />
            ) : (
              <ShieldAlert className="h-8 w-8" strokeWidth={2.25} />
            )}
          </div>

          <h1
            className={`mt-6 font-display text-3xl font-semibold text-balance ${
              verified ? 'text-seal' : 'text-foreground'
            }`}
          >
            {failed
              ? 'No record found'
              : verified
                ? 'Verified organic'
                : 'Not certified organic'}
          </h1>

          <p className="mx-auto mt-3 max-w-measure-tight text-pretty text-sm leading-relaxed text-muted-foreground">
            {failed
              ? 'We have no certificate on file for this code. It may be mistyped, or the product may not be listed on Next360.'
              : verified
                ? 'The Next360 verification team checked this product’s NPOP certificate against its listing.'
                : `This product is listed as ${typeConfig?.label ?? 'self-declared'} — the seller’s own claim, not a certified organic one.`}
          </p>
        </section>

        {/* ── The evidence ─────────────────────────────────── */}
        {product && (
          <>
            <Card padding="none" className="mt-6 overflow-hidden">
              <div className="flex gap-4 border-b border-border p-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                  {product.primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.primaryImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <Leaf className="h-7 w-7 text-border-strong" strokeWidth={1.25} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold leading-snug text-foreground">
                    {product.name}
                  </h2>
                  {product.sellerName && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Store className="h-3.5 w-3.5" />
                      {product.sellerName}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <TypeMark type={product.productType} size="sm" />
                    {product.price != null && <Price value={product.price} size="sm" />}
                  </div>
                </div>
              </div>

              <dl className="divide-y divide-border text-sm">
                {[
                  {
                    label: 'Verification ID',
                    value: <CertificateId id={product.verificationId ?? String(id)} />,
                    Icon: FileCheck,
                  },
                  ...(product.certificateNumber
                    ? [
                        {
                          label: 'Certificate no.',
                          value: <CertificateId id={product.certificateNumber} />,
                          Icon: FileCheck,
                        },
                      ]
                    : []),
                  ...(product.certifyingBody
                    ? [{ label: 'Issued by', value: product.certifyingBody, Icon: ShieldCheck }]
                    : []),
                  ...(product.certificateExpiry
                    ? [
                        {
                          label: 'Valid until',
                          value: new Date(product.certificateExpiry).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }),
                          Icon: Calendar,
                        },
                      ]
                    : []),
                  ...(product.verifiedAt
                    ? [
                        {
                          label: 'Verified on',
                          value: new Date(product.verifiedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }),
                          Icon: Calendar,
                        },
                      ]
                    : []),
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <dt className="inline-flex items-center gap-2 text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 text-subtle-foreground" />
                      {label}
                    </dt>
                    <dd className="text-right font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Button block size="lg" className="mt-6" asChild>
              <Link href={`/products/${product.slug ?? product.id}`}>
                View this product
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </>
        )}

        {failed && (
          <Button block size="lg" className="mt-6" asChild>
            <Link href="/products?verified=true">
              Browse verified organic products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {/* ── What this means ──────────────────────────────── */}
        <section className="mt-10 rounded-xl border border-border bg-surface-sunken p-5">
          <h3 className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <Info className="h-4 w-4 text-primary" />
            What this check means
          </h3>
          <p className="mt-2.5 text-pretty text-sm leading-relaxed text-muted-foreground">
            A verified result means a person on our team read the seller&rsquo;s NPOP certificate
            and confirmed its number, issuing body, scope and expiry cover this product. It is not
            an automated keyword match, and it is not the seller vouching for themselves.
          </p>
          <Link
            href="/help"
            className="mt-3 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            How verification works
          </Link>
        </section>
      </main>
    </div>
  );
}
