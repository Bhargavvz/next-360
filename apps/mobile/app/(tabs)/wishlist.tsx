import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>
          ❤️ Wishlist
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          Your saved products will appear here.{'\n'}Coming in Phase 5.
        </Text>
      </View>
    </SafeAreaView>
  );
}
