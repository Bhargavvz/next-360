'use client';

import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="container py-10 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold font-display">Terms of Service</h1>
        </div>
        <p className="text-muted-foreground">Last updated: August 2026</p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">By accessing or using the Next360 platform, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">2. Platform Use</h2>
          <p className="text-muted-foreground">Next360 is a marketplace connecting buyers with verified organic product sellers. We do not own or warehouse any products. Sellers are responsible for the accuracy of their listings and the quality of their products.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">3. Account Responsibilities</h2>
          <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years old to use the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">4. Orders & Payments</h2>
          <p className="text-muted-foreground">When you place an order, you enter into a contract directly with the seller. Next360 facilitates the transaction. Payments are processed securely through Razorpay. Prices are inclusive of all applicable taxes.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">5. Seller Obligations</h2>
          <p className="text-muted-foreground">Sellers must provide accurate product information, hold valid organic certifications for products listed as organic, fulfil orders promptly, and comply with all applicable laws and regulations.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">6. Prohibited Activities</h2>
          <p className="text-muted-foreground">You may not: misrepresent products or their certifications, engage in fraudulent transactions, attempt to bypass our platform to transact directly, or engage in any activity that violates applicable laws.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">7. Limitation of Liability</h2>
          <p className="text-muted-foreground">Next360 is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid for the transaction giving rise to the claim.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">8. Governing Law</h2>
          <p className="text-muted-foreground">These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">9. Contact</h2>
          <p className="text-muted-foreground">For questions about these Terms, contact us at <a href="mailto:legal@next360.in" className="text-primary hover:underline">legal@next360.in</a>.</p>
        </section>
      </div>
    </div>
  );
}
