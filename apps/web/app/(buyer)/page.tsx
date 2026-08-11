import Link from 'next/link';
import { ArrowRight, ShieldCheck, Leaf, Sparkles, TrendingUp, Truck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const categories = [
    { name: 'Honey & Sweeteners', icon: '🍯', slug: 'honey', color: 'from-amber-500/10 to-amber-500/5' },
    { name: 'Spices & Masalas', icon: '🌶️', slug: 'spices', color: 'from-red-500/10 to-red-500/5' },
    { name: 'Oils & Ghee', icon: '🫒', slug: 'oils', color: 'from-green-500/10 to-green-500/5' },
    { name: 'Grains & Flours', icon: '🌾', slug: 'grains', color: 'from-yellow-500/10 to-yellow-500/5' },
    { name: 'Tea & Coffee', icon: '🍵', slug: 'tea', color: 'from-emerald-500/10 to-emerald-500/5' },
    { name: 'Personal Care', icon: '🧴', slug: 'personal-care', color: 'from-pink-500/10 to-pink-500/5' },
    { name: 'Snacks', icon: '🥜', slug: 'snacks', color: 'from-orange-500/10 to-orange-500/5' },
    { name: 'Baby & Kids', icon: '👶', slug: 'baby', color: 'from-blue-500/10 to-blue-500/5' },
  ];

  const trustFeatures = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: 'NPOP Verified',
      description: 'Every organic product carries verified NPOP certification. No greenwashing.',
      color: 'text-emerald-600 bg-emerald-500/10',
    },
    {
      icon: <Leaf className="h-6 w-6" />,
      title: 'Verified Sellers',
      description: 'KYC-verified sellers with approved business credentials and quality standards.',
      color: 'text-green-600 bg-green-500/10',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Transparent Certs',
      description: 'View actual certificate details — number, certifying body, validity dates.',
      color: 'text-amber-600 bg-amber-500/10',
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: 'Verified Reviews',
      description: 'Only verified buyers can review. No fake reviews, ever.',
      color: 'text-blue-600 bg-blue-500/10',
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Track Everything',
      description: 'Real-time order tracking from seller dispatch to your doorstep.',
      color: 'text-purple-600 bg-purple-500/10',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Fair Pricing',
      description: 'Direct from verified sellers. No middlemen markup.',
      color: 'text-rose-600 bg-rose-500/10',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-background to-amber-50/40 dark:from-emerald-950/20 dark:via-background dark:to-amber-950/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

        <div className="container relative py-20 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 animate-in fade-in-0 slide-in-from-bottom-3 duration-700">
              <ShieldCheck className="h-4 w-4" />
              India&apos;s Trust-First Organic Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] font-[family-name:var(--font-outfit)] animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
              Shop Verified.{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                Buy with Confidence.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-200">
              Every organic product is NPOP certified and independently verified.
              Know exactly what you&apos;re buying — from farm to your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                  <Leaf className="h-5 w-5" />
                  Explore Products
                </Button>
              </Link>
              <Link href="/seller/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Become a Seller
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-6 pt-6 text-sm text-muted-foreground animate-in fade-in-0 duration-700 delay-500">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {['🧑‍🌾', '👩‍🍳', '👨‍💼', '👩‍⚕️'].map((emoji, i) => (
                    <div key={i} className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-sm">{emoji}</div>
                  ))}
                </div>
                <span className="font-medium">500+ Verified Sellers</span>
              </div>
              <span className="text-border">|</span>
              <span className="font-medium">5000+ Products</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16 md:py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)]">Shop by Category</h2>
            <p className="text-muted-foreground mt-1">Find verified organic products in every category</p>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group">
              <div className={`flex flex-col items-center gap-3 p-4 rounded-2xl border bg-gradient-to-b ${cat.color} hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-md`}>
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Next360 */}
      <section className="border-y bg-muted/30">
        <div className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)]">Why Next360?</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              We built the platform customers deserve — one where trust isn&apos;t optional, it&apos;s the foundation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="group flex gap-4 p-5 rounded-2xl border bg-card hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-105`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classification Guide */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-outfit)]">Product Classifications</h2>
          <p className="text-muted-foreground mt-2">Understand exactly what you&apos;re buying</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="relative rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-50 to-background p-6 overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 mb-3">
                <ShieldCheck className="h-5 w-5" /> NPOP VERIFIED
              </div>
              <h3 className="font-bold text-xl mb-2 font-[family-name:var(--font-outfit)]">Organic</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                NPOP certified, verified by Next360 team. Certificate details visible to every buyer. This is the gold standard.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border-2 border-amber-500/30 bg-gradient-to-b from-amber-50 to-background p-6 overflow-hidden group hover:border-amber-500/50 transition-colors">
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="text-sm font-bold text-amber-600 mb-3">🟡 SELF-DECLARED</div>
              <h3 className="font-bold text-xl mb-2 font-[family-name:var(--font-outfit)]">Natural</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Claimed natural by seller. No NPOP certification required. We verify the seller, not the claim.
              </p>
            </div>
          </div>

          <div className="relative rounded-2xl border-2 border-blue-500/30 bg-gradient-to-b from-blue-50 to-background p-6 overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="text-sm font-bold text-blue-600 mb-3">🔵 SELF-DECLARED</div>
              <h3 className="font-bold text-xl mb-2 font-[family-name:var(--font-outfit)]">Eco-Friendly</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Claimed eco-friendly by seller. Focus on sustainable packaging and practices. Seller-verified only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-10 md:p-16 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          <div className="relative space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-outfit)]">Ready to shop verified?</h2>
            <p className="text-emerald-100 max-w-lg mx-auto">
              Join thousands of conscious consumers who trust Next360 for authentic organic products.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/products">
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 shadow-lg w-full sm:w-auto">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/seller/dashboard">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                  Sell on Next360
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
