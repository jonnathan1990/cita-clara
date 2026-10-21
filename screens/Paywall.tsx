import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import { getPrice, Country, Plan } from '../lib/pricing';
import { subscribeWithStripe } from '../lib/stripe';
import { track } from '../lib/telemetry';

export default function Paywall({ navigation }: any) {
  const [country] = useState<Country>('MX');
  const [plan, setPlan] = useState<Plan>('monthly');
  const [loading, setLoading] = useState(false);
  const p = getPrice(country, plan);

  async function subscribe() {
    setLoading(true);
    try {
      await track('purchase_started', { plan, provider: 'stripe' });
      const result = await subscribeWithStripe(country, plan);

      if (result.ok) {
        await track('purchase_success', { plan, provider: 'stripe' });
        Alert.alert('Suscripción activa', 'Gracias. Ya tienes CitaClara+.');
        navigation.goBack();
      } else {
        if (result.error !== 'Pago cancelado') {
          Alert.alert('Error', result.error ?? 'No se pudo completar el pago');
        }
        await track('purchase_canceled', { plan, provider: 'stripe' });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>CitaClara+</Text>
      <Text>Más filtros, más likes y control de visibilidad.</Text>
      <Text style={{ fontSize: 20 }}>
        {p.amount} {p.currency}/{plan === 'monthly' ? 'mes' : 'trimestre'}
      </Text>
      <Text style={{ color: '#555' }}>
        Total visible. Renovación automática. Cancelable en 2 pantallas.
      </Text>

      <Button
        title={plan === 'monthly' ? 'Cambiar a trimestral' : 'Cambiar a mensual'}
        onPress={() => setPlan(plan === 'monthly' ? 'quarterly' : 'monthly')}
        disabled={loading}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#D6336C" />
      ) : (
        <Button title="Suscribirme" onPress={subscribe} />
      )}

      <Button
        title="Gestionar / cancelar"
        onPress={() => navigation.navigate('CancelSubscription')}
        disabled={loading}
      />

      <Text style={{ fontSize: 12, color: '#888', marginTop: 12 }}>
        Sin urgencia artificial. Sin precio por edad, género, orientación o salud.
        Sin plan semanal por defecto. Pagos procesados por Stripe.
      </Text>
    </View>
  );
}
