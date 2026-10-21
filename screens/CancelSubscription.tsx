import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { cancelMySubscription } from '../lib/subscription';
import { openCustomerPortal } from '../lib/stripe';
import { track } from '../lib/telemetry';

export default function CancelSubscription() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  async function confirmCancel() {
    setLoading(true);
    try {
      const res = await cancelMySubscription(2);
      if (!res.ok) {
        Alert.alert('Error', res.error!);
        return;
      }

      await track('subscription_canceled', { screens: 2, provider: 'stripe' });

      const portal = await openCustomerPortal();
      if (!portal.ok) {
        Alert.alert(
          'Cancelación registrada',
          'Tu cancelación quedó registrada. Si no se refleja en Stripe, escribe a soporte.'
        );
      } else {
        Alert.alert(
          'Cancelación iniciada',
          'Te llevamos al portal de Stripe para confirmar. Mantienes acceso hasta el final del periodo.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (step === 1) {
    return (
      <View style={{ padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Cancelar suscripción</Text>
        <Text>
          Sin llamadas ni pasos ocultos. Mantienes acceso hasta el final del periodo ya pagado.
        </Text>
        <Button title="Continuar" onPress={() => setStep(2)} />
        <Button
          title="Abrir portal de Stripe"
          onPress={async () => {
            const r = await openCustomerPortal();
            if (!r.ok) Alert.alert('Error', r.error ?? 'No se pudo abrir el portal');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Confirmar cancelación</Text>
      <Text>Se cancelará la renovación. Prorrateo aplicado en los primeros 14 días.</Text>
      <Button title="Confirmar" onPress={confirmCancel} disabled={loading} />
      <Button title="No cancelar" onPress={() => setStep(1)} disabled={loading} />
    </View>
  );
}
