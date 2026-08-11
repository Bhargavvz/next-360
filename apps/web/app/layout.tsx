import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    'trusted organic',
  ],
  openGraph: {
    title: 'Next360 — Shop Verified. Buy with Confidence.',
    description:
      'India\'s trust-first marketplace for verified organic, natural, and eco-friendly products.',
    siteName: 'Next360',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next360 — Shop Verified. Buy with Confidence.',
    description:
      'India\'s trust-first marketplace for verified organic products.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
