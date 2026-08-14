'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import Link from 'next/link';
import { toast } from 'sonner';

const OTP_LENGTH = 6;

export default function AuthPage() {
  const router = useRouter();
  const { requestOtp, login } = useAuth();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdowns driven by the server's challenge response rather than guessed here.
  const [resendIn, setResendIn] = useState(0);
  const [expiresIn, setExpiresIn] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const [redirectTo, setRedirectTo] = useState('/');

  // Read from the URL after mount rather than useSearchParams(), which would force
  // this page behind a Suspense boundary just to resolve one optional param.
  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get('redirect');
    // Only same-origin relative paths — never bounce the user to an external URL.
    if (target && target.startsWith('/') && !target.startsWith('//')) {
      setRedirectTo(target);
    }
  }, []);

  // One ticker drives both countdowns.
  useEffect(() => {
    if (step !== 'otp') return;
    const timer = setInterval(() => {
      setResendIn((s) => (s > 0 ? s - 1 : 0));
      setExpiresIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if (step === 'otp') otpInputRef.current?.focus();
  }, [step]);

  const sendOtp = useCallback(
    async (isResend: boolean) => {
      if (phone.length !== 10 || !/^[6-9]/.test(phone)) {
        setError('Enter a valid 10-digit Indian mobile number');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const challenge = await requestOtp(phone);
        setResendIn(challenge?.resendIn ?? 30);
        setExpiresIn(challenge?.expiresIn ?? 300);
        setDevOtp(challenge?.devMode ? challenge.devOtp ?? null : null);
        setOtp('');
        setStep('otp');
        toast.success(isResend ? 'OTP resent' : 'OTP sent', {
          description: `Sent to +91 ${phone}`,
        });
      } catch (err) {
        const message = apiErrorMessage(err, 'Could not send the OTP. Please try again.');
        setError(message);
        toast.error('Failed to send OTP', { description: message });
      } finally {
        setLoading(false);
      }
    },
    [phone, requestOtp]
  );

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (code.length !== OTP_LENGTH) {
        setError(`Enter the ${OTP_LENGTH}-digit OTP`);
        return;
      }

      setLoading(true);
      setError('');
      try {
        await login(phone, code);
        toast.success('Signed in', { description: 'Welcome to Next360' });
        router.push(redirectTo);
      } catch (err) {
        const message = apiErrorMessage(err, 'That OTP did not work. Please try again.');
        setError(message);
        setOtp('');
        otpInputRef.current?.focus();
      } finally {
        setLoading(false);
      }
    },
    [login, phone, redirectTo, router]
  );

  // Auto-submit as soon as the last digit lands — including from SMS autofill.
  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    setError('');
    if (digits.length === OTP_LENGTH) {
      void handleVerifyOtp(digits);
    }
  };

  const formatSeconds = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
  };

  return (
    <div className="grain flex min-h-screen items-center justify-center bg-moss-wash px-5 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" aria-label="Next360 home" className="inline-block">
            <Logo />
          </Link>
          <h1 className="mt-7 font-display text-3xl font-semibold text-foreground">
            {step === 'phone' ? 'Welcome back' : 'Verify your number'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 'phone'
              ? 'We’ll text you a one-time code — no password to remember.'
              : `We sent a ${OTP_LENGTH}-digit code to +91 ${phone}`}
          </p>
        </div>

        {/* Form */}
        <div className="mt-8 rounded-2xl border border-border bg-surface p-7 shadow-md">
          {step === 'phone' ? (
            <div className="space-y-5">
              <div>
                <label htmlFor="phone-input" className="block text-sm font-medium mb-1.5">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex h-11 items-center rounded-l-lg border border-r-0 border-input bg-muted px-3.5 text-sm font-medium text-muted-foreground">
                    +91
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && void sendOtp(false)}
                    className="h-11 flex-1 rounded-r-lg border border-input bg-surface px-3.5 text-base text-foreground transition-colors placeholder:text-subtle-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12"
                    autoFocus
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
              </div>
              <Button block size="lg" onClick={() => void sendOtp(false)} loading={loading}>
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <button
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setDevOtp(null);
                }}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change number
              </button>

              <div>
                <label htmlFor="otp-input" className="block text-sm font-medium mb-1.5">
                  Enter OTP
                </label>
                <input
                  id="otp-input"
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  disabled={loading}
                  className="h-14 w-full rounded-lg border border-input bg-surface text-center font-mono text-2xl tracking-[0.5em] text-foreground transition-colors placeholder:text-border-strong focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12 disabled:opacity-60"
                />
                {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
              </div>

              <Button
                block
                size="lg"
                onClick={() => void handleVerifyOtp(otp)}
                loading={loading}
                disabled={otp.length !== OTP_LENGTH}
              >
                Verify &amp; Sign In
              </Button>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {expiresIn > 0 ? `Expires in ${formatSeconds(expiresIn)}` : 'This code has expired'}
                </span>
                {resendIn > 0 ? (
                  <span>Resend in {resendIn}s</span>
                ) : (
                  <button
                    onClick={() => void sendOtp(true)}
                    disabled={loading}
                    className="text-primary font-medium hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              {devOtp && (
                <p className="text-xs text-center text-muted-foreground rounded-lg bg-muted/60 px-3 py-2">
                  SMS delivery is off in this environment. Use{' '}
                  <span className="font-mono font-bold text-foreground">{devOtp}</span>
                </p>
              )}
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
