import Link from 'next/link';
import { ShieldCheck, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/products' },
      { label: 'Verified organic', href: '/products?verified=true' },
      { label: 'Natural', href: '/products?productType=NATURAL' },
      { label: 'Eco-friendly', href: '/products?productType=ECO_FRIENDLY' },
    ],
  },
  {
    title: 'Sell',
    links: [
      { label: 'Become a seller', href: '/seller/register' },
      { label: 'Seller dashboard', href: '/seller/dashboard' },
      { label: 'KYC verification', href: '/seller/kyc' },
      { label: 'Certificates', href: '/seller/certificates' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help centre', href: '/help' },
      { label: 'Track an order', href: '/orders' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-sunken">
      <div className="container py-14 md:py-18">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link href="/" aria-label="Next360 home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-measure-tight text-pretty text-sm leading-relaxed text-muted-foreground">
              India&rsquo;s trust-first marketplace for organic food. We read the certificate so
              you don&rsquo;t have to guess — and then we show it to you anyway.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-seal-border bg-seal-muted px-3 py-1.5 text-xs font-medium text-seal">
              <ShieldCheck className="h-3.5 w-3.5" />
              Every organic listing is NPOP-verified
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-7 sm:grid-cols-3 lg:col-span-8">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h4 className="text-2xs font-medium uppercase tracking-[0.14em] text-subtle-foreground">
                  {column.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-border pt-7 sm:flex-row">
          <p className="text-xs text-subtle-foreground">
            © {new Date().getFullYear()} Next360. Made in India.
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[
                { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
                { Icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
                { Icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="grid h-9 w-9 place-items-center rounded-lg text-subtle-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
