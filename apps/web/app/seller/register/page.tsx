'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BUSINESS_TYPES = ['INDIVIDUAL', 'PROPRIETORSHIP', 'PARTNERSHIP', 'PRIVATE_LIMITED', 'LLP', 'OTHER'];

export default function SellerRegisterPage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    businessName: '',
    businessType: 'INDIVIDUAL',
    description: '',
    gstin: '',
    phone: '',
    email: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    bankAccountNumber: '',
    ifscCode: '',
    bankAccountName: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { router.push('/auth?redirect=/seller/register'); return; }
    setLoading(true); setError(null);
    // Normalize phone to +91XXXXXXXXXX
    const normalizedPhone = form.phone.startsWith('+91')
      ? form.phone
      : `+91${form.phone.replace(/\D/g, '').slice(-10)}`;
    try {
      await api.post('/api/v1/seller/register', { ...form, phone: normalizedPhone });
      await refreshUser(); // Re-fetch user so SELLER role is active immediately
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <div className="max-w-md w-full text-center rounded-2xl border bg-card p-10">
          <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your seller application is under review. We'll notify you within 24-48 hours once approved.
          </p>
          <Link href="/"><Button variant="outline" className="mr-3">Back to Home</Button></Link>
          <Link href="/seller/dashboard"><Button>Seller Dashboard</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-2xl">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)]">Become a Seller</h1>
          <p className="text-muted-foreground mt-2">
            Join Next360 and sell your organic & natural products to thousands of conscious buyers.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl p-8 space-y-8">
          {/* Business Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Information</h3>
            <Input label="Business Name *" placeholder="Your Store Name" value={form.businessName} onChange={e => set('businessName', e.target.value)} required />
            <div>
              <label className="block text-sm font-medium mb-1.5">Business Type *</label>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.businessType} onChange={e => set('businessType', e.target.value)}>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea className="w-full min-h-[100px] rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Describe your business and the products you sell…" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="GSTIN" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e => set('gstin', e.target.value)} />
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-muted-foreground text-sm font-medium">+91</span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone.replace(/^\+91/, '')}
                  onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  className="flex-1 rounded-r-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            </div>
            <Input label="Business Email" type="email" placeholder="store@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>

          {/* Address */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Address</h3>
            <Input label="Address Line 1 *" placeholder="Street address" value={form.addressLine1} onChange={e => set('addressLine1', e.target.value)} required />
            <div className="grid grid-cols-3 gap-4">
              <Input label="City *" placeholder="Bengaluru" value={form.city} onChange={e => set('city', e.target.value)} required />
              <Input label="State *" placeholder="Karnataka" value={form.state} onChange={e => set('state', e.target.value)} required />
              <Input label="Pincode *" placeholder="560001" value={form.pincode} onChange={e => set('pincode', e.target.value)} required />
            </div>
          </div>

          {/* Bank */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bank Details</h3>
            <Input label="Account Holder Name *" placeholder="As per bank records" value={form.bankAccountName} onChange={e => set('bankAccountName', e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Account Number *" placeholder="000123456789" value={form.bankAccountNumber} onChange={e => set('bankAccountNumber', e.target.value)} required />
              <Input label="IFSC Code *" placeholder="SBIN0001234" value={form.ifscCode} onChange={e => set('ifscCode', e.target.value)} required />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Submit Application
          </Button>
        </form>
      </div>
    </div>
  );
}
