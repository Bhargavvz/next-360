import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../lib/theme';

export interface PaymentInit {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  method: 'RAZORPAY' | 'COD';
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

export type PaymentResult =
  | { status: 'success'; paymentId: string; orderId: string; signature: string }
  | { status: 'dismissed' }
  | { status: 'failed'; reason: string };

/**
 * Razorpay Checkout rendered inside a WebView.
 *
 * Razorpay has no Expo-compatible native module, so the standard approach is to host
 * the official checkout script in a page and relay its callbacks back to React Native
 * over `postMessage`. The result is only ever treated as paid after the caller verifies
 * the signature server-side.
 */
function buildCheckoutHtml(init: PaymentInit): string {
  const options = {
    key: init.keyId,
    amount: init.amountInPaise,
    currency: init.currency || 'INR',
    name: 'Next360',
    description: `Order ${init.orderNumber}`,
    order_id: init.gatewayOrderId,
    prefill: {
      name: init.customerName ?? '',
      contact: init.customerPhone ?? '',
      email: init.customerEmail ?? '',
    },
    theme: { color: Colors.primary },
  };

  // JSON.stringify keeps user-supplied values (name/email) safely escaped inside the script.
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body { margin: 0; height: 100%; background: #ffffff;
        font-family: -apple-system, system-ui, sans-serif; }
      .status { display: flex; height: 100%; align-items: center; justify-content: center;
        color: #6b7280; font-size: 14px; }
    </style>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
    <div class="status">Opening secure checkout…</div>
    <script>
      var send = function (payload) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      };

      function start() {
        if (!window.Razorpay) {
          send({ status: 'failed', reason: 'Could not reach the payment provider.' });
          return;
        }

        var options = ${JSON.stringify(options)};

        options.handler = function (response) {
          send({
            status: 'success',
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        };
        options.modal = { ondismiss: function () { send({ status: 'dismissed' }); } };

        var checkout = new window.Razorpay(options);
        checkout.on('payment.failed', function (response) {
          send({
            status: 'failed',
            reason: (response && response.error && response.error.description)
              || 'Payment failed at the gateway'
          });
        });
        checkout.open();
      }

      if (document.readyState === 'complete') start();
      else window.addEventListener('load', start);
    </script>
  </body>
</html>`;
}

interface Props {
  visible: boolean;
  init: PaymentInit | null;
  onResult: (result: PaymentResult) => void;
}

export function PaymentSheet({ visible, init, onResult }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  const html = useMemo(() => (init ? buildCheckoutHtml(init) : ''), [init]);

  if (!init) return null;

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      onResult(JSON.parse(event.nativeEvent.data) as PaymentResult);
    } catch {
      onResult({ status: 'failed', reason: 'Unexpected response from the payment page' });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => onResult({ status: 'dismissed' })}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Secure Payment</Text>
          <TouchableOpacity
            onPress={() => onResult({ status: 'dismissed' })}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color={Colors.gray800} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <WebView
            originWhitelist={['*']}
            source={{ html, baseUrl: 'https://checkout.razorpay.com' }}
            onMessage={handleMessage}
            onLoadEnd={() => setLoading(false)}
            onError={() =>
              onResult({ status: 'failed', reason: 'Could not load the payment page' })
            }
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
          />
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loaderText}>Loading secure checkout…</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.lg, fontWeight: Typography.semibold, color: Colors.gray900 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    gap: Spacing[3],
  },
  loaderText: { fontSize: Typography.sm, color: Colors.gray500 },
});
