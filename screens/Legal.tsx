import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function Legal() {
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Legal</Text>
      <Text>Privacidad, términos y reembolsos disponibles en citaclara.app</Text>
      <Text style={{ color: '#555' }}>
        Precios solo por país y plan. Cancelación en ≤2 pantallas. Reembolso proporcional 14 días.
      </Text>
    </ScrollView>
  );
}
