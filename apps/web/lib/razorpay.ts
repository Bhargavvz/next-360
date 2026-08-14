'use client';

import { api, apiErrorMessage } from './api';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/**
 * Ensure the Razorpay checkout script is loaded.
 *
 * The root layout injects it with `strategy="lazyOnload"`, which can still be pending
 * when a fast user reaches checkout. Rather than telling them to try again, load it on
 * demand and wait for it.
 */
export function loadRazorpay(timeoutMs = 15000): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in a browser'));
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    const script = existing ?? document.createElement('script');

    const timer = setTimeout(
      () => reject(new Error('Payment system took too long to load. Check your connection.')),
      timeoutMs
    );

    const settle = () => {
      clearTimeout(timer);
      window.Razorpay
        ? resolve()
        : reject(new Error('Payment system failed to load. Please refresh and try again.'));
    };

    script.addEventListener('load', settle, { once: true });
    script.addEventListener(
      'error',
      () => {
        clearTimeout(timer);
        reject(new Error('Could not reach the payment provider. Please try again.'));
      },
      { once: true }
    );

    if (!existing) {
      script.src = CHECKOUT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

export interface PaymentInit {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  method: 'RAZORPAY' | 'COD';
  status: string;
  gatewayOrderId?: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  keyId?: string;
  mock?: boolean;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
}

export type PaymentOutcome =
  | { status: 'paid' }
  | { status: 'dismissed' }
  | { status: 'failed'; reason: string };

/**
 * Open the Razorpay checkout and settle once the payment is verified server-side,
 * the user dismisses the modal, or the gateway reports a failure.
 *
 * Success is only ever reported after `/payments/verify` accepts the signature — the
 * client callback alone is not proof of payment.
 */
export function openRazorpayCheckout(init: PaymentInit): Promise<PaymentOutcome> {
  return new Promise((resolve) => {
    if (!window.Razorpay) {
      resolve({ status: 'failed', reason: 'Payment system is not available' });
      return;
    }

    let settled = false;
    const settle = (outcome: PaymentOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const checkout = new window.Razorpay({
      key: init.keyId,
      amount: init.amountInPaise,
      currency: init.currency || 'INR',
      name: 'Next360',
      description: `Order ${init.orderNumber}`,
      order_id: init.gatewayOrderId,
      prefill: {
        name: init.customerName ?? undefined,
        contact: init.customerPhone ?? undefined,
        email: init.customerEmail ?? undefined,
      },
      theme: { color: '#10b981' },
      modal: {
        ondismiss: () => settle({ status: 'dismissed' }),
      },
      handler: async (response: any) => {
        try {
          await api.post('/api/v1/payments/verify', {
            orderId: init.orderId,
            gatewayPaymentId: response.razorpay_payment_id,
            gatewayOrderId: response.razorpay_order_id,
            gatewaySignature: response.razorpay_signature,
          });
          settle({ status: 'paid' });
        } catch (err) {
          settle({
            status: 'failed',
            reason: apiErrorMessage(err, 'We could not confirm your payment.'),
          });
        }
      },
    });

    checkout.on('payment.failed', (response: any) => {
      settle({
        status: 'failed',
        reason: response?.error?.description || 'Payment failed at the gateway',
      });
    });

    checkout.open();
  });
}

/**
 * Tell the API a checkout was abandoned or failed so the pending payment does not
 * linger. Best-effort — the webhook is the authoritative record either way.
 */
export async function reportPaymentFailure(
  orderId: string,
  gatewayOrderId: string | undefined,
  reason: string
) {
  await api
    .post('/api/v1/payments/failed', { orderId, gatewayOrderId, reason })
    .catch(() => {});
}
