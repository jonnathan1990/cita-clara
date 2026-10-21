import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { track } from '../lib/telemetry';

export default function PauseBySuccess({ navigation }: any) {
  async function pause(days: number) {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;
    const until = new Date();
    until.setDate(until.getDate() + days);
    const { error } = await supabase
      .from('profiles')
      .update({ paused_until: until.toISOString() })
      .eq('id', me.user.id);
    if (error) return Alert.alert('Error', error.message);
    await track('pause_success_activated', { days });
    Alert.alert('Pausa activada', `Tu perfil estará oculto ${days} días.`);
    navigation.goBack();
  }

  return (
    <View style={{ padding: 24, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Pausa por éxito</Text>
      <Text>
        Si encontraste a alguien (o solo quieres un respiro), puedes ocultar tu perfil sin borrar nada.
      </Text>
      <Button title="Pausar 7 días" onPress={() => pause(7)} />
      <Button title="Pausar 30 días" onPress={() => pause(30)} />
      <Button title="Cancelar" onPress={() => navigation.goBack()} />
    </View>
  );
}
