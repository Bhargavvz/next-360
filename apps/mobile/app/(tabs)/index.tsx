import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView>
        {/* Header */}
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#0a0a0a' }}>
              Next360
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              Shop verified. Buy with confidence.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <Text style={{ fontSize: 20 }}>🛒</Text>
          </View>
        </View>

        {/* Search Bar Placeholder */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={{
            backgroundColor: '#f3f4f6',
            borderRadius: 12,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <Text style={{ color: '#9ca3af' }}>🔍</Text>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>
              Search organic products...
            </Text>
          </View>
        </View>

        {/* Verified Organic CTA */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={{
            backgroundColor: '#f0fdf4',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: '#bbf7d0',
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#166534' }}>
              🟢 Show Verified Organic Only
            </Text>
            <Text style={{ fontSize: 13, color: '#15803d', marginTop: 4 }}>
              All products displayed are NPOP certified and verified by Next360.
            </Text>
          </View>
        </View>

        {/* Trust Section */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 12 }}>
            Why Next360?
          </Text>
          {[
            { icon: '✓', text: 'Verified organic products' },
            { icon: '✓', text: 'Verified sellers' },
            { icon: '✓', text: 'Transparent certification' },
            { icon: '✓', text: 'Secure payments' },
            { icon: '✓', text: 'Reliable delivery' },
            { icon: '✓', text: 'Customer reviews' },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
              <Text style={{ color: '#16a34a', fontWeight: '700' }}>{item.icon}</Text>
              <Text style={{ color: '#374151', fontSize: 14 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Placeholder sections */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 12 }}>
            Featured Verified Products
          </Text>
          <View style={{
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            padding: 40,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>
              Products will appear here after Phase 5
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#0a0a0a', marginBottom: 12 }}>
            Categories
          </Text>
          <View style={{
            backgroundColor: '#f9fafb',
            borderRadius: 12,
            padding: 40,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>
              Categories will appear here after Phase 2
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
