import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">N</div>
              <span className="text-lg font-bold font-[family-name:var(--font-outfit)]">Next<span className="text-primary">360</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's trust-first marketplace for verified organic, natural, and eco-friendly products.
              Every organic claim is backed by a verifiable certificate.
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

          {/* Sellers */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Sell on Next360</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/seller/register" className="hover:text-foreground transition-colors font-medium text-primary">Become a Seller</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-foreground transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/seller/kyc" className="hover:text-foreground transition-colors">KYC Verification</Link></li>
              <li><Link href="/seller/certificates" className="hover:text-foreground transition-colors">Certificates</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/orders" className="hover:text-foreground transition-colors">Track Order</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Next360. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>NPOP Verified Platform — Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
