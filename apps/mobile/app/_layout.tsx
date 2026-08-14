import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useAuthStore } from '../lib/auth';
import { useTheme, useStatusBarStyle } from '../lib/useTheme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function RootLayout() {
  const { initialize, isLoading } = useAuthStore();
  const [authReady, setAuthReady] = useState(false);
  const theme = useTheme();
  const statusBarStyle = useStatusBarStyle();

  // Fraunces carries the brand; Inter is the UI face. Holding the splash until
  // both resolve avoids the jarring system-font flash on first paint.
  const [fontsReady] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initialize().then(() => setAuthReady(true));
  }, [initialize]);

  const ready = authReady && fontsReady && !isLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  // Painted in the theme background so there is no white flash between the
  // splash image and the first screen.
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={statusBarStyle} />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="address/index" />
          <Stack.Screen name="address/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="address/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="help" options={{ presentation: 'modal' }} />
          <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
          <Stack.Screen name="wishlist" options={{ presentation: 'modal' }} />
          <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
          <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
          <Stack.Screen name="data-privacy" options={{ presentation: 'modal' }} />
          <Stack.Screen name="category/[slug]" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
