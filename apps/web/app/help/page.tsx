'use client';

import Link from 'next/link';
import { ShieldCheck, Mail, Phone, MapPin, ChevronRight, FileText, HelpCircle, BookOpen } from 'lucide-react';

const FAQ_ITEMS = [
  { q: 'How do I know the products are genuinely organic?', a: 'Every product on Next360 is backed by NPOP-certified documents uploaded by the seller and verified by our admin team. You can scan the QR code on any product to view its certification details.' },
  { q: 'How long does delivery take?', a: 'Delivery typically takes 3-7 business days depending on your location. You can track your order from the Orders section in your account.' },
  { q: 'What is your return policy?', a: 'We offer a 7-day return window for damaged, defective, or incorrect items. Please raise a return request from the order details page.' },
  { q: 'How do I become a seller on Next360?', a: 'Sign up with a seller account, complete KYC verification, and upload your organic certifications. Once verified by our admin team, you can start listing products.' },
  { q: 'Is my payment information secure?', a: 'Yes, all payments are processed securely through Razorpay, which is PCI-DSS compliant. We never store your card details.' },
  { q: 'How do I apply a coupon code?', a: 'Add items to your cart and proceed to checkout. You\'ll see a "Have a coupon?" field in the cart summary where you can enter your code.' },
];

export default function HelpPage() {
  return (
    <div className="container py-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-display">Help Center</h1>
        <p className="text-muted-foreground mt-2">Find answers to common questions or reach out to our support team.</p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <a href="mailto:support@next360.in" className="rounded-xl border bg-card p-6 hover:border-primary/40 transition-colors group">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold">Email Support</p>
          <p className="text-sm text-muted-foreground mt-1">support@next360.in</p>
          <p className="text-xs text-muted-foreground mt-2">Response within 24 hours</p>
        </a>
        <a href="tel:+918000000000" className="rounded-xl border bg-card p-6 hover:border-primary/40 transition-colors group">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold">Phone Support</p>
          <p className="text-sm text-muted-foreground mt-1">+91 80000 00000</p>
          <p className="text-xs text-muted-foreground mt-2">Mon–Sat, 9 AM – 6 PM IST</p>
        </a>
        <div className="rounded-xl border bg-card p-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <p className="font-semibold">Office Address</p>
          <p className="text-sm text-muted-foreground mt-1">Next360 Technologies</p>
          <p className="text-xs text-muted-foreground mt-2">India</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="rounded-xl border bg-card divide-y mb-12">
        <div className="px-6 py-4">
          <h2 className="font-semibold">Quick Links</h2>
        </div>
        {[
          { href: '/orders', label: 'Track your order', Icon: BookOpen },
          { href: '/privacy', label: 'Privacy Policy', Icon: ShieldCheck },
          { href: '/terms', label: 'Terms of Service', Icon: FileText },
          { href: '/help', label: 'Help Center', Icon: HelpCircle },
        ].map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold font-display mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {FAQ_ITEMS.map((item, i) => (
          <details key={i} className="rounded-xl border bg-card group">
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-sm list-none hover:bg-accent/50 transition-colors rounded-xl">
              {item.q}
              <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-3" />
            </summary>
            <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
