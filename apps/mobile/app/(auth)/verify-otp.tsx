import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyOtpScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#0a0a0a', marginBottom: 8 }}>
          Verify OTP
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          OTP verification will be implemented in Phase 3.
        </Text>
      </View>
    </SafeAreaView>
  );
}
