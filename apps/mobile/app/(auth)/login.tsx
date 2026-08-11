import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#0a0a0a', marginBottom: 8 }}>
          Next360
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
          Shop verified. Buy with confidence.
        </Text>
        <Text style={{ fontSize: 16, color: '#374151', textAlign: 'center' }}>
          Phone OTP login will be implemented in Phase 3.
        </Text>
      </View>
    </SafeAreaView>
  );
}
