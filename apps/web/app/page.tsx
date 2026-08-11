import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">Next360</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Products
            </Link>
            <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Sell on Next360
            </Link>
            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-organic-light px-4 py-1.5 text-sm font-medium text-organic-dark border border-organic/20">
            🟢 Verified Organic Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Discover. Verify.{' '}
            <span className="text-primary">Buy with confidence.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            India&apos;s first trust-first marketplace for organic, natural, and eco-friendly products.
            Every organic product is NPOP certified and independently verified.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Shop Verified Organic
            </Link>
            <Link
              href="/seller/dashboard"
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-12 px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t bg-muted/40">
        <div className="container py-16 md:py-24">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Why Next360?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: '🟢',
                title: 'Verified Organic',
                description: 'Every organic product is NPOP certified and verified by our team. No false claims.',
              },
              {
                icon: '🛡️',
                title: 'Verified Sellers',
                description: 'All sellers undergo KYC verification and approval before listing products.',
              },
              {
                icon: '📋',
                title: 'Transparent Certification',
                description: 'View actual certification details — certificate number, body, validity, and more.',
              },
              {
                icon: '💳',
                title: 'Secure Payments',
                description: 'All payments are processed securely and verified server-side.',
              },
              {
                icon: '🚚',
                title: 'Reliable Delivery',
                description: 'Track your order from dispatch to doorstep with real-time updates.',
              },
              {
                icon: '⭐',
                title: 'Verified Reviews',
                description: 'Only verified buyers can review products. No fake reviews.',
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 rounded-xl bg-background border">
                <span className="text-3xl mb-4">{item.icon}</span>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classification Guide */}
      <section className="container py-16 md:py-24">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Understanding Product Classifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="rounded-xl border-2 border-organic/30 bg-organic-light p-6">
            <div className="text-sm font-bold text-organic mb-2">🟢 NPOP VERIFIED</div>
            <h3 className="font-semibold text-lg mb-2">Organic</h3>
            <p className="text-sm text-muted-foreground">
              NPOP certified, verified by Next360. Certificate details visible to buyers.
            </p>
          </div>
          <div className="rounded-xl border-2 border-natural/30 bg-natural-light p-6">
            <div className="text-sm font-bold text-natural mb-2">🟡 NATURAL — UNVERIFIED</div>
            <h3 className="font-semibold text-lg mb-2">Natural</h3>
            <p className="text-sm text-muted-foreground">
              Claimed natural by seller. No NPOP certification required or verified.
            </p>
          </div>
          <div className="rounded-xl border-2 border-eco/30 bg-eco-light p-6">
            <div className="text-sm font-bold text-eco mb-2">🔵 ECO-FRIENDLY — UNVERIFIED</div>
            <h3 className="font-semibold text-lg mb-2">Eco-Friendly</h3>
            <p className="text-sm text-muted-foreground">
              Claimed eco-friendly by seller. No NPOP certification required or verified.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Next360. Shop verified. Buy with confidence.</p>
        </div>
      </footer>
    </div>
  );
}
