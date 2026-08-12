import { Redirect } from 'expo-router';
import { useAuthStore } from '../lib/auth';

export default function Index() {
  const { hasSeenOnboarding, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
