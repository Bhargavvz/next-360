'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductCard } from '@/components/buyer/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Section, SectionHeader } from '@/components/ui/section';
import { PRODUCT_TYPES, VerifiedSeal, CertificateId } from '@/components/brand/trust-mark';
import {
  ShieldCheck, ArrowRight, Search, FileCheck, Truck,
  QrCode, Leaf, Sparkles,
} from 'lucide-react';

/** The four steps, phrased as what *we* do — not what the user must do. */
const PROMISE = [
  {
    n: '01',
    Icon: FileCheck,
    title: 'The seller submits proof',
    body: 'Business KYC, then the actual NPOP scope certificate for every organic line they want to list.',
  },
  {
    n: '02',
    Icon: ShieldCheck,
    title: 'A human reads it',
    body: 'Our verification team checks the certificate number, issuing body, scope and expiry against the listing.',
  },
  {
    n: '03',
    Icon: QrCode,
    title: 'You can check our work',
    body: 'Every verified product has a public certificate page. Scan the QR on the pack or open it from the listing.',
  },
  {
    n: '04',
    Icon: Truck,
    title: 'It ships from the source',
    body: 'Orders go straight from the farm or producer. No repacking, no relabelling in between.',
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicApi
        .get('/api/v1/search?size=8&sortBy=rating')
        .then((r) => setFeatured(r.data.data?.content ?? []))
        .catch(() => {}),
      publicApi
        .get('/api/v1/search?size=6&verifiedOnly=true')
        .then((r) => setVerified(r.data.data?.content ?? []))
        .catch(() => {}),
      publicApi
        .get('/api/v1/categories')
        .then((r) =>
          setCategories((r.data.data ?? []).filter((c: any) => !c.parentId).slice(0, 6))
        )
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────
          Asymmetric: type on the left, a stack of proof on the right.
          The claim and the evidence for it sit side by side, which is the
          whole argument of the product in one screen. */}
      <section className="relative overflow-hidden bg-moss-wash grain">
        <div className="container relative grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-8 lg:py-28">
          <div className="lg:col-span-6 lg:pt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-seal" />
              India&rsquo;s trust-first organic marketplace
            </div>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.03] tracking-tight text-balance text-foreground md:text-6xl lg:text-7xl">
              Know exactly
              <br />
              what you&rsquo;re
              <span className="relative ml-3 inline-block text-primary">
                eating
                {/* Hand-drawn underline — a small imperfection that keeps the
                    headline from feeling machine-set. */}
                <svg
                  className="absolute -bottom-2 left-0 w-full text-primary/35"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 8.5C40 4 80 2.5 120 4.5c25 1.2 50 3.5 78 2"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            <p className="mt-8 max-w-measure text-pretty text-lg leading-relaxed text-muted-foreground">
              Anyone can print “organic” on a label. On Next360 the claim comes with an NPOP
              certificate our team has actually read — and you can read it too, before you buy.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/products?verified=true">
                  Shop verified organic
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/products">Browse everything</Link>
              </Button>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-7">
              {[
                { value: 'NPOP', label: 'Certificates verified' },
                { value: 'KYC', label: 'On every seller' },
                { value: '0', label: 'Anonymous vendors' },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-semibold text-foreground">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Proof stack — a real certificate record, rendered as the product
              actually renders it. Showing the artefact beats describing it. */}
          <div className="lg:col-span-6 lg:pl-8">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <Card variant="raised" padding="lg" className="relative z-10 rotate-[-1.2deg]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
                      Certificate of record
                    </p>
                    <p className="mt-2 font-display text-xl font-semibold text-foreground">
                      Sundarban Raw Forest Honey
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Mitra Organics · West Bengal
                    </p>
                  </div>
                  <VerifiedSeal size="md" showLabel={false} />
                </div>

                <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                  {[
                    ['Certificate no.', <CertificateId key="c" id="NPOP/2024/WB/8842" />],
                    ['Issued by', 'APEDA-accredited body'],
                    ['Scope', 'Wild honey collection'],
                    ['Valid until', '10 Mar 2027'],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-center justify-between gap-4">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="text-right font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex items-center gap-2 rounded-lg bg-success-muted px-3 py-2.5 text-sm text-success">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Verified by the Next360 team on 14 Mar 2024
                </div>
              </Card>

              {/* Layered cards behind, suggesting a stack of records. */}
              <div
                aria-hidden
                className="absolute inset-x-4 -bottom-3 z-0 h-24 rotate-[1.5deg] rounded-xl border border-border bg-surface/70"
              />
              <div
                aria-hidden
                className="absolute inset-x-8 -bottom-6 -z-10 h-24 rotate-[3deg] rounded-xl border border-border bg-surface/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────── */}
      {categories.length > 0 && (
        <Section className="border-t border-border">
          <div className="container">
            <SectionHeader
              eyebrow="Browse"
              title="Shop by category"
              href="/products"
              hrefLabel="All categories"
            />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/products?categoryId=${category.id}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-5 text-center transition-all duration-250 ease-natural hover:-translate-y-0.5 hover:border-primary-border hover:shadow-md"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-primary-muted text-primary transition-transform duration-250 ease-natural group-hover:scale-110">
                    {category.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.imageUrl}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <Leaf className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── Verified rail ──────────────────────────────────── */}
      {(loading || verified.length > 0 || featured.length > 0) && (
      <Section className="border-t border-border bg-surface-sunken">
        <div className="container">
          <SectionHeader
            eyebrow="Certified"
            title="Verified organic this week"
            description="Each of these has an NPOP certificate on file that our team has checked line by line."
            href="/products?verified=true"
          />

          <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 lg:grid-cols-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : (verified.length ? verified : featured).slice(0, 6).map((p: any) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    imageUrl={p.primaryImageUrl}
                    price={p.price}
                    mrp={p.mrp}
                    rating={p.rating}
                    reviewCount={p.reviewCount}
                    isVerifiedOrganic={p.isVerifiedOrganic}
                    sellerName={p.sellerName}
                    productType={p.productType}
                    inStock={p.stock == null || p.stock > 0}
                    stock={p.stock}
                  />
                ))}
          </div>
        </div>
      </Section>
      )}

      {/* ── How verification works ─────────────────────────── */}
      <Section className="border-t border-border">
        <div className="container">
          <SectionHeader
            eyebrow="How it works"
            title="Four steps between a claim and your kitchen"
            description="Verification is a process, not a badge we hand out. Here is the whole of it."
            align="center"
          />

          <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISE.map((step, i) => (
              <div key={step.n} className="relative">
                {/* Connector, desktop only — the rhythm of a numbered sequence. */}
                {i < PROMISE.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-14 right-0 top-6 hidden h-px bg-gradient-to-r from-border to-transparent lg:block"
                  />
                )}

                <div className="relative grid h-12 w-12 place-items-center rounded-xl border border-border bg-surface text-primary shadow-xs">
                  <step.Icon className="h-5 w-5" />
                </div>

                <p className="mt-5 font-mono text-2xs text-subtle-foreground">{step.n}</p>
                <h3 className="mt-1.5 font-display text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Classification ─────────────────────────────────── */}
      <Section className="border-t border-border bg-surface-sunken">
        <div className="container">
          <SectionHeader
            eyebrow="Labels, honestly"
            title="Three labels. One of them is verified."
            description="We do not blur the line between certified and self-declared. Neither should a marketplace."
          />

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {(Object.keys(PRODUCT_TYPES) as (keyof typeof PRODUCT_TYPES)[]).map((key) => {
              const type = PRODUCT_TYPES[key];
              const isOrganic = key === 'ORGANIC';

              return (
                <Card
                  key={key}
                  variant={isOrganic ? 'seal' : 'flat'}
                  padding="lg"
                  className="flex flex-col"
                >
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl ${
                      isOrganic
                        ? 'bg-seal/12 text-seal'
                        : key === 'NATURAL'
                          ? 'bg-natural-muted text-natural'
                          : 'bg-eco-muted text-eco'
                    }`}
                  >
                    <type.Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                    {type.label}
                  </h3>
                  <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {type.claim}
                  </p>

                  <p
                    className={`mt-5 inline-flex items-center gap-1.5 text-xs font-medium ${
                      isOrganic ? 'text-seal' : 'text-muted-foreground'
                    }`}
                  >
                    {isOrganic ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Certificate on file · checked by us
                      </>
                    ) : (
                      'Seller-declared · KYC-verified seller'
                    )}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ── Featured ───────────────────────────────────────── */}
      {(loading || featured.length > 0) && (
      <Section className="border-t border-border">
        <div className="container">
          <SectionHeader
            eyebrow="Loved by buyers"
            title="Highest rated right now"
            href="/products?sortBy=rating"
          />

          <div className="mt-9 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : featured.slice(0, 4).map((p: any) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    imageUrl={p.primaryImageUrl}
                    price={p.price}
                    mrp={p.mrp}
                    rating={p.rating}
                    reviewCount={p.reviewCount}
                    isVerifiedOrganic={p.isVerifiedOrganic}
                    sellerName={p.sellerName}
                    productType={p.productType}
                    inStock={p.stock == null || p.stock > 0}
                    stock={p.stock}
                    variant="editorial"
                  />
                ))}
          </div>
        </div>
      </Section>
      )}

      {/* ── Seller CTA ─────────────────────────────────────── */}
      <Section className="border-t border-border">
        <div className="container">
          <div className="grain relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-primary-foreground md:px-14 md:py-18">
            <div className="relative z-10 max-w-2xl">
              <p className="text-2xs font-medium uppercase tracking-[0.14em] text-primary-foreground/70">
                For producers
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold text-balance md:text-4xl">
                If you have the certificate, you deserve the credit for it.
              </h2>
              <p className="mt-5 max-w-measure text-pretty leading-relaxed text-primary-foreground/80">
                Most marketplaces let anyone write “organic” in a title, which makes your
                certification worth nothing. Here it is the thing buyers see first.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/seller/register">
                    Start selling
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link href="/help">How verification works</Link>
                </Button>
              </div>
            </div>

            {/* Oversized watermark mark, cropped by the panel edge. */}
            <ShieldCheck
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 text-primary-foreground/[0.07]"
              strokeWidth={1}
            />
          </div>
        </div>
      </Section>

      {/* ── Search prompt ──────────────────────────────────── */}
      <Section className="border-t border-border">
        <div className="container text-center">
          <Search className="mx-auto h-6 w-6 text-subtle-foreground" />
          <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
            Looking for something specific?
          </h2>
          <p className="mx-auto mt-2 max-w-measure-tight text-sm text-muted-foreground">
            Search the full catalogue, or filter down to only the products carrying a verified
            certificate.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/products">Open the catalogue</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/products?verified=true">Verified only</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
