'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Store, ArrowRight, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Separate component so useEffect redirect is safe
function SuccessScreen({ onNavigate }: { onNavigate: () => void }) {
  useEffect(() => {
    const t = setTimeout(onNavigate, 3000);
    return () => clearTimeout(t);
  }, [onNavigate]);

  return (
    <div className="max-w-md w-full text-center rounded-2xl border bg-card p-10">
      <div className="h-20 w-20 bg-success-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>
      <h2 className="text-2xl font-bold font-display mb-2">Application Submitted!</h2>
      <p className="text-muted-foreground mb-2">
        Your seller application is under review. We will notify you within 24-48 hours once approved.
      </p>
      <p className="text-sm text-primary mb-6">Redirecting to seller dashboard in 3 seconds...</p>
      <div className="flex gap-3 justify-center">
        <Link href="/"><Button variant="outline">Back to Home</Button></Link>
        <Link href="/seller/dashboard"><Button>Seller Dashboard <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    </div>
  );
}

export default function SellerRegisterPage() {
  const { isAuthenticated, refreshUser, hasRole } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // If user is already a seller, go straight to the dashboard
  useEffect(() => {
    if (isAuthenticated && hasRole('SELLER')) {
      router.replace('/seller/dashboard');
    }
  }, [isAuthenticated, hasRole]);

  // Fields that map exactly to SellerRegistrationRequest:
  // businessName, businessDescription, businessAddress, phone, email, gstin, panNumber, location
  const [form, setForm] = useState({
    businessName: '',
    businessDescription: '',
    // We collect address parts then combine to businessAddress
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',   // stored without +91; we prepend on submit
    email: '',
    gstin: '',
    panNumber: '',
    location: '',
  });

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setFieldErrors(e => ({ ...e, [k]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/auth?redirect=/seller/register');
      return;
    }

    // Build phone: ensure +91XXXXXXXXXX format
    const digits = form.phone.replace(/\D/g, '');
    const phone = `+91${digits.slice(-10)}`;

    // Combine address parts into businessAddress
    const parts = [form.addressLine1, form.city, form.state].filter(Boolean);
    if (form.pincode) parts.push(`PIN ${form.pincode}`);
    const businessAddress = parts.join(', ');

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!form.businessName.trim()) errors.businessName = 'Business name is required';
    if (!form.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!form.state.trim()) errors.state = 'State is required';
    if (digits.length < 10) errors.phone = 'Enter a valid 10-digit mobile number';
    if (!form.email.trim()) errors.email = 'Email is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Payload matches SellerRegistrationRequest exactly
    const payload: Record<string, string> = {
      businessName: form.businessName.trim(),
      businessAddress,
      phone,
      email: form.email.trim(),
    };
    if (form.businessDescription.trim()) payload.businessDescription = form.businessDescription.trim();
    if (form.location.trim()) payload.location = form.location.trim();
    // Only send gstin/pan if filled (they have regex validation on backend)
    if (form.gstin.trim()) payload.gstin = form.gstin.trim().toUpperCase();
    if (form.panNumber.trim()) payload.panNumber = form.panNumber.trim().toUpperCase();

    try {
      await api.post('/api/v1/seller/register', payload);
      await refreshUser();
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      // Backend returns validation errors as { errors: { field: message } }
      if (data?.errors && typeof data.errors === 'object') {
        setFieldErrors(data.errors);
        setError('Please fix the errors below and try again.');
      } else {
        setError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <SuccessScreen onNavigate={() => router.push('/seller/dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display">Become a Seller</h1>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Join Next360 and sell your organic and natural products to thousands of conscious buyers.
          </p>
        </div>

        {/* Auth warning */}
        {!isAuthenticated && (
          <div className="mb-6 flex items-start gap-3 text-sm bg-warning-muted border border-warning/30 text-warning px-4 py-3 rounded-lg">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              You must be logged in to register as a seller.{' '}
              <Link href="/auth?redirect=/seller/register" className="font-semibold underline">Log in first</Link>
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg border border-destructive/20">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-card border rounded-2xl divide-y overflow-hidden">
          {/* ── Business Info ─────────────────────── */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Information</h3>

            <div>
              <label className="block text-sm font-medium mb-1.5">Business / Store Name <span className="text-destructive">*</span></label>
              <input
                type="text"
                placeholder="e.g. Organic Farm Direct"
                value={form.businessName}
                onChange={e => set('businessName', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.businessName ? 'border-destructive' : ''}`}
              />
              {fieldErrors.businessName && <p className="text-xs text-destructive mt-1">{fieldErrors.businessName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Business Description</label>
              <textarea
                placeholder="Describe your farm, products, farming practices, certifications..."
                value={form.businessDescription}
                onChange={e => set('businessDescription', e.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Business Location / City</label>
              <input
                type="text"
                placeholder="e.g. Bangalore, Karnataka"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">Shown publicly on your seller profile</p>
            </div>
          </div>

          {/* ── Contact ──────────────────────────── */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Business Phone <span className="text-destructive">*</span></label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-muted-foreground text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={`flex-1 rounded-r-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.phone ? 'border-destructive' : ''}`}
                  />
                </div>
                {fieldErrors.phone && <p className="text-xs text-destructive mt-1">{fieldErrors.phone}</p>}
                <p className="text-xs text-muted-foreground mt-1">Must start with 6, 7, 8, or 9</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Business Email <span className="text-destructive">*</span></label>
                <input
                  type="email"
                  placeholder="store@yourdomain.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.email ? 'border-destructive' : ''}`}
                />
                {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
              </div>
            </div>
          </div>

          {/* ── Address ──────────────────────────── */}
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Business Address <span className="text-destructive">*</span></h3>

            <div>
              <label className="block text-sm font-medium mb-1.5">Street / Area</label>
              <input
                type="text"
                placeholder="Shop no, building, street, area"
                value={form.addressLine1}
                onChange={e => set('addressLine1', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.addressLine1 ? 'border-destructive' : ''}`}
              />
              {fieldErrors.addressLine1 && <p className="text-xs text-destructive mt-1">{fieldErrors.addressLine1}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Bengaluru"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.city ? 'border-destructive' : ''}`}
                />
                {fieldErrors.city && <p className="text-xs text-destructive mt-0.5">{fieldErrors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">State</label>
                <input
                  type="text"
                  placeholder="Karnataka"
                  value={form.state}
                  onChange={e => set('state', e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${fieldErrors.state ? 'border-destructive' : ''}`}
                />
                {fieldErrors.state && <p className="text-xs text-destructive mt-0.5">{fieldErrors.state}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Pincode</label>
                <input
                  type="text"
                  placeholder="560001"
                  value={form.pincode}
                  onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

          {/* ── Tax / Compliance (optional) ───────── */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tax & Compliance</h3>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Optional</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-info bg-info-muted border border-blue-100 px-3 py-2.5 rounded-lg">
              <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              GSTIN and PAN can be added later through your seller profile. They're required to receive payouts.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">GSTIN</label>
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={e => set('gstin', e.target.value.toUpperCase().slice(0, 15))}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono ${fieldErrors.gstin ? 'border-destructive' : ''}`}
                />
                {fieldErrors.gstin && <p className="text-xs text-destructive mt-1">{fieldErrors.gstin}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">PAN Number</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={form.panNumber}
                  onChange={e => set('panNumber', e.target.value.toUpperCase().slice(0, 10))}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono ${fieldErrors.panNumber ? 'border-destructive' : ''}`}
                />
                {fieldErrors.panNumber && <p className="text-xs text-destructive mt-1">{fieldErrors.panNumber}</p>}
              </div>
            </div>
          </div>

          {/* ── Submit ───────────────────────────── */}
          <div className="p-6">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!isAuthenticated}
            >
              Submit Application
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              By submitting you agree to our{' '}
              <Link href="/terms" className="hover:underline">Terms of Service</Link>{' '}
              and{' '}
              <Link href="/seller-policy" className="hover:underline">Seller Policy</Link>
            </p>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Already a seller?{' '}
          <Link href="/seller/dashboard" className="text-primary hover:underline font-medium">Go to Seller Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
