'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/buyer/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShieldCheck, ArrowRight, Leaf, Award, Users, Package,
  Star, TrendingUp, Search,
  Sprout, Recycle, Clock, BarChart3, Lock
} from 'lucide-react';

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Organic',
    description: 'Every ORGANIC listing is backed by NPOP-certified documentation reviewed by our team before approval.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Award,
    title: 'Seller Verification',
    description: 'All sellers complete KYC before listing. Business documents are reviewed. No anonymous vendors.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Star,
    title: 'Verified Purchase Reviews',
    description: 'Only buyers who have completed delivery of an order can leave a review. No fake feedback.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Lock,
    title: 'Certificate Trail',
    description: 'Each organic product has a unique verification ID. Scan or visit to see the original certificate.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: BarChart3,
    title: 'Live Inventory',
    description: 'Real-time stock tracking. What you see is what is available. No overselling, no backorders.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Clock,
    title: 'Farm-to-Doorstep',
    description: 'Sellers ship directly from their farms or storage. No middlemen, no re-branding, no adulteration.',
    color: 'bg-teal-50 text-teal-600',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse & Discover', description: 'Browse verified organic, natural, and eco-friendly products from sellers across India.' },
  { step: '02', title: 'Verify the Claim', description: 'Every product shows its type, certification status, and seller KYC status — before you buy.' },
  { step: '03', title: 'Order & Pay', description: 'Add to cart and place your order. Pay Cash on Delivery or use supported payment methods.' },
  { step: '04', title: 'Direct Delivery', description: 'Your order is packed and shipped directly by the seller. Track status in real time.' },
];

const PRODUCT_TYPES = [
  {
    icon: ShieldCheck,
    label: 'Organic',
    badge: 'NPOP Verified',
    color: 'border-emerald-200 bg-emerald-50/50',
    iconColor: 'text-emerald-600',
    description: 'NPOP certified, verified by Next360. Certificate visible to every buyer.',
  },
  {
    icon: Sprout,
    label: 'Natural',
    badge: 'Self-Declared',
    color: 'border-amber-200 bg-amber-50/50',
    iconColor: 'text-amber-600',
    description: 'Claimed natural by seller. No synthetic pesticides or chemicals. Seller is KYC verified.',
  },
  {
    icon: Recycle,
    label: 'Eco-Friendly',
    badge: 'Self-Declared',
    color: 'border-blue-200 bg-blue-50/50',
    iconColor: 'text-blue-600',
    description: 'Sustainable packaging and practices. Focus on environmental responsibility.',
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    publicApi.get('/api/v1/search?size=8&sortBy=rating')
      .then(r => setFeaturedProducts(r.data.data?.content || []))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
    publicApi.get('/api/v1/categories')
      .then(r => setCategories((r.data.data || []).filter((c: any) => !c.parentId).slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative border-b bg-gradient-to-b from-emerald-50/60 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent pointer-events-none" />
        <div className="container relative py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-700 uppercase bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full mb-6">
              <ShieldCheck className="h-3.5 w-3.5" />
              India's Trust-First Organic Marketplace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight font-[family-name:var(--font-outfit)] mb-6">
              Know exactly<br />
              <span className="text-emerald-600">what you're buying.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
              Next360 is the only Indian marketplace where every organic claim is backed by
              a verified certificate — visible to buyers before they purchase.
              No greenwashing. No false labelling.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto">
                  <Search className="h-4 w-4" /> Browse Products
                </Button>
              </Link>
              <Link href="/products?verified=true">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <ShieldCheck className="h-4 w-4" /> Verified Organic Only
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t">
              {[
                { icon: ShieldCheck, label: 'Certificate verified' },
                { icon: Users, label: 'KYC-verified sellers' },
                { icon: Star, label: 'Verified purchase reviews' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="h-4 w-4 text-emerald-600" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Product type explanation ────────────────────── */}
      <section className="container py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-3">
            Three levels of transparency
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every product on Next360 carries one of these classifications.
            You always know exactly what the claim is — and what backs it.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PRODUCT_TYPES.map(t => (
            <div key={t.label} className={`rounded-2xl border-2 p-6 ${t.color}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                  <t.icon className={`h-5 w-5 ${t.iconColor}`} />
                </div>
                <div>
                  <p className="font-bold text-lg">{t.label}</p>
                  <Badge variant="outline" className="text-[9px] mt-0.5">{t.badge}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────── */}
      <section className="border-y bg-muted/20">
        <div className="container py-16 md:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)]">
                Featured Products
              </h2>
              <p className="text-muted-foreground mt-1">Verified quality from trusted sellers</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  imageUrl={p.imageUrl || p.images?.[0]?.url}
                  price={p.price}
                  mrp={p.mrp}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                  isVerifiedOrganic={p.isVerifiedOrganic || p.verifiedOrganic}
                  sellerName={p.sellerName}
                  inStock={p.inStock !== false}
                  productType={p.productType}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border bg-card">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium">Products are being added</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for fresh organic products</p>
            </div>
          )}
          <div className="text-center mt-8 sm:hidden">
            <Link href="/products"><Button variant="outline">View All Products</Button></Link>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="container py-16 md:py-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)]">Shop by Category</h2>
              <p className="text-muted-foreground mt-1">Organic products across all categories</p>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All categories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map(cat => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border bg-card hover:border-primary/40 hover:bg-primary/[0.03] transition-all text-center">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Leaf className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-medium leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── How it works ────────────────────────────────── */}
      <section className="border-y bg-muted/20">
        <div className="container py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-3">How it works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From discovery to delivery — a simple, transparent process
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-border -translate-x-4" />
                )}
                <div className="text-4xl font-black text-primary/10 font-[family-name:var(--font-outfit)] mb-3">{step.step}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Next360 ─────────────────────────────────── */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)] mb-3">
            Built on trust, not claims
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every feature on Next360 exists to make organic shopping less risky and more reliable.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {TRUST_FEATURES.map(f => (
            <div key={f.title} className="flex gap-4 p-5 rounded-2xl border bg-card hover:shadow-sm transition-shadow">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Seller CTA ──────────────────────────────────── */}
      <section className="container pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buyer CTA */}
          <div className="relative rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 text-white overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full translate-x-16 -translate-y-16" />
            <div className="relative">
              <ShieldCheck className="h-8 w-8 mb-4 text-emerald-200" />
              <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                Shop with confidence
              </h3>
              <p className="text-emerald-100 text-sm leading-relaxed mb-5">
                Every product backed by verified seller KYC and real customer reviews. No greenwashing allowed.
              </p>
              <Link href="/products">
                <Button className="bg-white text-emerald-700 hover:bg-white/90">
                  Browse Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          {/* Seller CTA */}
          <div className="relative rounded-2xl border-2 border-dashed p-8 bg-card overflow-hidden">
            <div className="relative">
              <TrendingUp className="h-8 w-8 mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)] mb-2">
                Sell on Next360
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                Reach conscious buyers who pay a premium for genuine organic products.
                Complete KYC, list your products, and start selling.
              </p>
              <Link href="/seller/register">
                <Button variant="outline">
                  Become a Seller <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
