'use client';

import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container py-10 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold font-display">Privacy Policy</h1>
        </div>
        <p className="text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground">We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, phone number, email address, and delivery addresses.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">We use your information to process orders and payments, send order confirmations and updates, provide customer support, improve our platform, and comply with legal obligations.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Information Sharing</h2>
          <p className="text-muted-foreground">We do not sell your personal information. We share information with sellers only to the extent necessary to fulfil your orders, and with service providers (payment processors, delivery partners) under strict confidentiality agreements.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Data Security</h2>
          <p className="text-muted-foreground">We implement industry-standard security measures including encryption in transit (HTTPS), encrypted storage of sensitive data, and regular security audits. Payments are processed via Razorpay, which is PCI-DSS compliant.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Your Rights</h2>
          <p className="text-muted-foreground">You have the right to access, update, or delete your personal data. You can manage most of this from your account settings. For data deletion requests, contact us at <a href="mailto:privacy@next360.in" className="text-primary hover:underline">privacy@next360.in</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Cookies</h2>
          <p className="text-muted-foreground">We use essential cookies to keep you logged in and to remember your cart. We do not use tracking cookies or third-party advertising cookies.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Contact Us</h2>
          <p className="text-muted-foreground">If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@next360.in" className="text-primary hover:underline">privacy@next360.in</a>.</p>
        </section>
      </div>
    </div>
  );
}
