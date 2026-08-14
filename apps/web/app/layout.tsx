import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

/**
 * Fraunces carries the brand. It is a variable serif with optical sizing and
 * a "wonk" axis, which is what keeps large headings warm and hand-made rather
 * than corporate. Only the weights actually used are requested.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  // Loaded as a variable font so the SOFT/WONK axes are addressable — next/font
  // rejects `axes` alongside a fixed weight list.
  axes: ['SOFT', 'WONK', 'opsz'],
});

/** Reserved for certificate IDs and other data that must not look editorial. */
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://next360.in'),
  title: {
    default: 'Next360 — Know exactly what you are eating',
    template: '%s · Next360',
  },
  description:
    "India's trust-first marketplace for verified organic food. Every organic listing is backed by an NPOP certificate you can read yourself, from a seller who passed KYC.",
  keywords: [
    'organic products India',
    'NPOP certified',
    'verified organic',
    'organic marketplace',
    'natural products',
    'eco-friendly',
  ],
  openGraph: {
    title: 'Next360 — Know exactly what you are eating',
    description:
      "Every organic claim on Next360 is backed by an NPOP certificate you can read yourself.",
    siteName: 'Next360',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next360 — Know exactly what you are eating',
    description: 'Verified organic. Certificates you can actually read.',
  },
  robots: { index: true, follow: true },
  appleWebApp: { capable: true, title: 'Next360', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Kept in sync at runtime by the theme provider.
  themeColor: '#FBFAF7',
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground">

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {/* Toaster reads the theme, so it must sit inside the providers. */}
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
