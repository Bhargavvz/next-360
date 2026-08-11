'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const { requestOtp, login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    if (phone.length < 10) { setError('Enter a valid phone number'); return; }
    setLoading(true);
    setError('');
    try {
      await requestOtp(phone);
      setStep('otp');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setError('Enter a valid OTP'); return; }
    setLoading(true);
    setError('');
    try {
      await login(phone, otp);
      router.push('/');
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/50 via-background to-amber-50/30 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">N</div>
            <span className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Next<span className="text-primary">360</span></span>
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)]">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in with your phone number</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {step === 'phone' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 bg-muted text-muted-foreground text-sm font-medium">+91</span>
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="flex-1 rounded-r-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
              </div>
              <Button className="w-full" size="lg" onClick={handleRequestOtp} loading={loading}>
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center text-sm text-muted-foreground mb-2">
                OTP sent to <span className="font-medium text-foreground">+91 {phone}</span>
                <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="text-primary ml-2 hover:underline">Change</button>
              </div>
              <Input
                label="Enter OTP"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                error={error}
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
              <Button className="w-full" size="lg" onClick={handleVerifyOtp} loading={loading}>
                Verify & Login
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                In development mode, use OTP: <span className="font-mono font-bold">123456</span>
              </p>
            </div>
          )}
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Secure, encrypted login</span>
        </div>
      </div>
    </div>
  );
}
