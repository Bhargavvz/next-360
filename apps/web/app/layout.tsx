import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: {
    default: 'Next360 — Shop Verified. Buy with Confidence.',
    template: '%s | Next360',
  },
  description:
    'India\'s trust-first marketplace for verified organic, natural, and eco-friendly products. Every organic product is NPOP certified and verified.',
  keywords: [
    'organic products',
    'verified organic',
    'NPOP certified',
    'natural products',
    'eco-friendly',
    'organic marketplace',
  ],
  openGraph: {
    title: 'Next360 — Shop Verified. Buy with Confidence.',
    description: 'India\'s trust-first marketplace for verified organic, natural, and eco-friendly products.',
    siteName: 'Next360',
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
