import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../lib/auth';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const { initialize, isLoading, hasSeenOnboarding, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initialize().then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [isReady, isLoading]);

  if (!isReady || isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#f9fafb' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="help" options={{ presentation: 'modal' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          <Stack.Screen name="address/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="wishlist" options={{ presentation: 'modal' }} />
          <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
          <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
          <Stack.Screen name="data-privacy" options={{ presentation: 'modal' }} />
          <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
