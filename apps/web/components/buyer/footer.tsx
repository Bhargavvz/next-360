import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">N</div>
              <span className="text-lg font-bold font-[family-name:var(--font-outfit)]">Next<span className="text-primary">360</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India&apos;s trust-first marketplace for verified organic, natural, and eco-friendly products.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/products?verified=true" className="hover:text-foreground transition-colors">Verified Organic</Link></li>
              <li><Link href="/products?type=NATURAL" className="hover:text-foreground transition-colors">Natural</Link></li>
              <li><Link href="/products?type=ECO_FRIENDLY" className="hover:text-foreground transition-colors">Eco-Friendly</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Next360</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-foreground transition-colors">Sell on Next360</Link></li>
              <li><Link href="/trust" className="hover:text-foreground transition-colors">Trust & Verification</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Next360. Shop verified. Buy with confidence.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">🟢 NPOP Verified Platform</span>
            <span>•</span>
            <span>Made in India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
